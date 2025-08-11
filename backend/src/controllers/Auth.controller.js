import { Auth } from '../models/Auth.model.js';
import { loginSchema } from '../schemas/login.schema.js';
import { ZodError } from 'zod';
import apiResponse from '../utils/api-response.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';

/**
 * @class
 * @classdesc Controller class for handling authentication-related API requests.
 */
export class AuthController {
	/**
	 * Creates an instance of AuthController.
	 * @constructor
	 */
	constructor() {}

	/**
	 * Handles login requests
	 * @param {Request} req - The incoming request
	 * @param {Response} res - The response to be sent back
	 * @returns {Promise<void>} A promise that resolves when the user has been logged in
	 */
	async login(req, res) {
		try {
			// Parse the request body using the loginSchema
			const parsedData = loginSchema.parse(req.body);
			// Login the user and return a 200 response with the JWT token
			const token = await Auth.login(parsedData);

			return apiResponse(
				{
					success: true,
					message: 'User logged in successfully',
					data: { token },
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
						message: 'Invalid request data',
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
						message: 'User does not exist',
						code: 404,
					},
					res,
				);
			}

			// If the error is an ACCOUNT_INACTIVE error, return a 403 response
			if (error.message === 'ACCOUNT_INACTIVE') {
				return apiResponse(
					{
						success: false,
						message: 'User account is inactive',
						code: 403,
					},
					res,
				);
			}

			// If the error is an INVALID_PASSWORD error, return a 401 response
			if (error.message === 'INVALID_PASSWORD') {
				return apiResponse(
					{
						success: false,
						message: 'Invalid password',
						code: 401,
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
