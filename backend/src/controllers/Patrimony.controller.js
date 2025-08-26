import { ZodError } from 'zod';
import { Patrimony } from '../models/Patrimony.model.js';
import apiResponse from '../utils/api-response.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';
import {
	createPatrimonySchema,
	createManyPatrimoniesSchema,
	updatePatrimonySchema,
	findAllPatrimoniesSchema,
	codeSchema,
} from '../schemas/patrimony.schema.js';

export class PatrimonyController {
	constructor() {}

	async create(req, res) {
		try {
			const parsed_data = createPatrimonySchema.parse(req.body);

			const patrimony = await Patrimony.create(parsed_data);

			return apiResponse(
				{
					success: true,
					message: 'Patrimony created successfully',
					data: patrimony,
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

			if (error.message === 'CODE_ALREADY_EXISTS') {
				return apiResponse(
					{
						success: false,
						message: 'Patrimony code already exists',
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

	async createMany(req, res) {
		try {
			const parsed_data = createManyPatrimoniesSchema.parse(req.body);

			const patrimonies = await Patrimony.createMany(
				parsed_data.patrimonies,
			);

			return apiResponse(
				{
					success: true,
					message: `${patrimonies.length} patrimonies created successfully`,
					data: patrimonies,
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

			if (error.message === 'DUPLICATE_CODES_IN_REQUEST') {
				return apiResponse(
					{
						success: false,
						message: 'Duplicate codes found in request',
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'CODES_ALREADY_EXIST') {
				return apiResponse(
					{
						success: false,
						message: 'Some patrimony codes already exist',
						errors: {
							existingCodes: error.existingCodes,
						},
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
			const parsed_data = findAllPatrimoniesSchema.parse(req.query);

			const patrimonies = await Patrimony.findAll(parsed_data);

			return apiResponse(
				{
					success: true,
					message: 'Patrimonies found successfully',
					data: patrimonies,
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

	async findByCode(req, res) {
		try {
			const parsed_code = codeSchema.parse(req.params.code);

			const patrimony = await Patrimony.findByCode(parsed_code);

			return apiResponse(
				{
					success: true,
					message: 'Patrimony found successfully',
					data: patrimony,
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

	async update(req, res) {
		try {
			const parsed_code = codeSchema.parse(req.params.code);
			const parsed_data = updatePatrimonySchema.parse(req.body);

			const patrimony = await Patrimony.update(parsed_code, parsed_data);

			return apiResponse(
				{
					success: true,
					message: 'Patrimony updated successfully',
					data: patrimony,
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

			if (error.message === 'CODE_ALREADY_EXISTS') {
				return apiResponse(
					{
						success: false,
						message: 'Patrimony code already exists',
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

	async delete(req, res) {
		try {
			const parsed_code = codeSchema.parse(req.params.code);

			console.log(parsed_code);

			const patrimony = await Patrimony.delete(parsed_code);

			return apiResponse(
				{
					success: true,
					message: 'Patrimony deleted successfully',
					data: patrimony,
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

			if (error.message === 'PATRIMONY_HAS_TICKETS') {
				return apiResponse(
					{
						success: false,
						message:
							'Cannot delete patrimony with associated tickets',
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
}
