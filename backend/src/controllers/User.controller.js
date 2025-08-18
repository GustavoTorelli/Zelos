import { User } from '../models/User.model.js';
import { userCreateSchema, userUpdateSchema } from '../schemas/user.schema.js';
import { idSchema } from '../schemas/generic.schema.js';
import apiResponse from '../utils/api-response.js';
import { ZodError } from 'zod';
import zodErrorFormatter from '../utils/zod-error-formatter.js';

/**
 * @class
 * @classdesc Controller class for handling user-related API requests.
 */
export class UserController {
	/**
	 * Creates an instance of UserController.
	 * @constructor
	 */
	constructor() {}

	/**
	 * Handles requests for creates a new user
	 * @param {Request} req - The incoming request
	 * @param {Response} res - The response to be sent back
	 * @returns {Promise<void>} A promise that resolves when the user has been created
	 */
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

	/**
	 * Handles requests for retrieving all users
	 * @param {Request} req - The incoming request
	 * @param {Response} res - The response to be sent back
	 * @returns {Promise<void>} A promise that resolves when the users have been retrieved
	 */
	async getAll(req, res) {
		try {
			const includeInactive =
				req.query.inactive === 'true' ? true : false;

			// Retrieve all users
			const users = await User.findAll({ includeInactive });

			// Return a 200 response with the users
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
			// Return a 500 response with the error message
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

	/**
	 * Handles requests for retrieving a single user
	 * @param {Request} req - The incoming request
	 * @param {Response} res - The response to be sent back
	 * @returns {Promise<void>} A promise that resolves when the user has been retrieved
	 */
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

	/**
	 * Handles requests for updating a user
	 * @param {Request} req - The incoming request
	 * @param {Response} res - The response to be sent back
	 * @returns {Promise<void>} A promise that resolves when the user has been updated
	 */
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

	/**
	 * Handles requests for deleting a user
	 * @param {Request} req - The incoming request
	 * @param {Response} res - The response to be sent back
	 * @returns {Promise<void>} A promise that resolves when the user has been deleted
	 */
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

	/**
	 * Handles requests for activating a user
	 * @param {Request} req - The incoming request
	 * @param {Response} res - The response to be sent back
	 * @returns {Promise<void>} A promise that resolves when the user has been activated
	 */
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

	/**
	 * Handles requests for deactivating a user
	 * @param {Request} req - The incoming request
	 * @param {Response} res - The response to be sent back
	 * @returns {Promise<void>} A promise that resolves when the user has been deactivated
	 */
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
