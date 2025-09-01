import { User } from '../models/User.model.js';
import {
	userCreateSchema,
	userUpdateSchema,
	userFilterSchema,
} from '../schemas/user.schema.js';
import { idSchema } from '../schemas/generic.schema.js';
import apiResponse from '../utils/api-response.js';
import { ZodError } from 'zod';
import zodErrorFormatter from '../utils/zod-error-formatter.js';

export class UserController {
	constructor() {}

	async create(req, res) {
		try {
			const parsedData = userCreateSchema.parse(req.body);

			const user = await User.create(parsedData);

			return apiResponse(
				{
					code: 201,
					success: true,
					message: 'User created successfully',
					data: user,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						code: 400,
						success: false,
						message: 'Validation error',
						errors: zodErrorFormatter(error),
					},
					res,
				);
			}

			if (error.message === 'ROLE_NOT_TECHNICIAN') {
				return apiResponse(
					{
						code: 400,
						success: false,
						message:
							'Categories can only be assigned to technicians',
					},
					res,
				);
			}

			if (error.message === 'INVALID_CATEGORIES') {
				return apiResponse(
					{
						code: 422,
						success: false,
						message: 'Some categories are invalid or inactive',
						errors: {
							invalid: error.invalidCategories || [],
							inactive: error.inactiveCategories || [],
						},
					},
					res,
				);
			}

			if (error.message === 'EMAIL_ALREADY_EXISTS') {
				return apiResponse(
					{
						code: 409,
						success: false,
						message: 'Email already exists',
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

	async getAll(req, res) {
		try {
			const filters = userFilterSchema.parse(req.query);

			const users = await User.findAll(filters);

			return apiResponse(
				{
					success: true,
					message: 'Users found successfully',
					data: users,
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				apiResponse(
					{
						success: false,
						message: 'Bad Request',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
				return;
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

	async getById(req, res) {
		try {
			// Parse the ID from the params
			const parsedId = idSchema.parse(req.params.id);

			// Retrieve the user
			const user = await User.find(parsedId);

			// Return a 200 response with the user
			return apiResponse(
				{
					success: true,
					message: 'User found Successfully',
					data: user,
					code: 200,
				},
				res,
			);
		} catch (error) {
			// If the error is a Zod error, return a 400 response with the validation errors
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Bad Request',
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
						message: 'User not found',
						errors: error.message,
						code: 404,
					},
					res,
				);
			}

			// Otherwise, return a 500 response with the error message
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
			const parsedData = userUpdateSchema.parse(req.body);

			const user = await User.update(parsedId, parsedData);

			return apiResponse(
				{
					code: 200,
					success: true,
					message: 'User updated successfully',
					data: user,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						code: 400,
						success: false,
						message: 'Validation error',
						errors: zodErrorFormatter(error),
					},
					res,
				);
			}

			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						code: 404,
						success: false,
						message: 'User not found',
					},
					res,
				);
			}

			if (error.message === 'ROLE_NOT_TECHNICIAN') {
				return apiResponse(
					{
						code: 400,
						success: false,
						message:
							'Categories can only be assigned to technicians',
					},
					res,
				);
			}

			if (error.message === 'INVALID_CATEGORIES') {
				return apiResponse(
					{
						code: 422,
						success: false,
						message: 'Some categories are invalid or inactive',
						errors: {
							invalid: error.invalidCategories || [],
							inactive: error.inactiveCategories || [],
						},
					},
					res,
				);
			}

			if (error.message === 'EMAIL_ALREADY_EXISTS') {
				return apiResponse(
					{
						code: 409,
						success: false,
						message: 'Email already exists',
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

	async delete(req, res) {
		try {
			// Parse the ID from the params
			const parsedId = idSchema.parse(req.params.id);

			// Delete the user and return a 204 response
			await User.delete(parsedId);
			return apiResponse(
				{
					success: true,
					message: 'User deleted successfully',
					code: 200,
				},
				res,
			);
		} catch (error) {
			// If the error is a Zod error, return a 400 response with the validation errors
			if (error instanceof ZodError) {
				return apiResponse(
					{ success: false, message: 'Invalid Data', code: 400 },
					res,
				);
			}

			// If the error is a NOT_FOUND error, return a 404 response
			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'User not found',
						code: 404,
					},
					res,
				);
			}

			// Otherwise, return a 500 response with the error message
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

	async activate(req, res) {
		try {
			// Parse the ID from the params
			const parsedId = idSchema.parse(req.params.id);

			// Instance the user, activate it and return a 200 response
			const userInstance = new User({ id: parsedId });
			const activatedUser = await userInstance.active();

			return apiResponse(
				{
					success: true,
					message: 'User account has been activated',
					data: activatedUser,
					code: 200,
				},
				res,
			);
		} catch (error) {
			// If the error is a Zod error, return a 400 response with the validation errors
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			// If the error is a NOT_FOUND error, return a 404 response
			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'User not found',
						code: 404,
					},
					res,
				);
			}

			// Otherwise, return a 500 response with the error message
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

	async deactivate(req, res) {
		try {
			// Parse the ID from the params
			const parsedId = idSchema.parse(req.params.id);

			// Instance the user, deactivate it and return a 200 response
			const userInstance = new User({ id: parsedId });
			const deactivatedUser = await userInstance.deactivate();

			return apiResponse(
				{
					success: true,
					message: 'User account has been deactivated',
					data: deactivatedUser,
					code: 200,
				},
				res,
			);
		} catch (error) {
			// If the error is a Zod error, return a 400 response with the validation errors
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			// If the error is a NOT_FOUND error, return a 404 response
			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'User not found',
						code: 404,
					},
					res,
				);
			}

			// Otherwise, return a 500 response with the error message
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
