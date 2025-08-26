import { Auth } from '../models/Auth.model.js';
import {
	loginSchema,
	passwordRecoverySchema,
	resetPasswordSchema,
} from '../schemas/auth.schema.js';
import { ZodError } from 'zod';
import apiResponse from '../utils/api-response.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';

export class AuthController {
	constructor() {}

	async login(req, res) {
		try {
			// Parse the request body using the loginSchema
			const parsed_data = loginSchema.parse(req.body);
			// Login the user and return a 200 response with the JWT token
			const token = await Auth.login(parsed_data);

			// Set the JWT token as a cookie
			res.cookie('jwt_token', token, {
				httpOnly: true,
				maxAge: 24 * 60 * 60 * 1000, // 1 day
				sameSite: 'lax',
			});

			const response_data = {
				success: true,
				message: 'Logged in successfully',
				code: 200,
			};

			if (process.env.ENVIRONMENT === 'dev') {
				response_data.data = { token };
			}

			return apiResponse(response_data, res);
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

	async logout(req, res) {
		res.clearCookie('jwt_token');
		return apiResponse(
			{
				success: true,
				message: 'Logged out successfully',
				code: 200,
			},
			res,
		);
	}

	async me(req, res) {
		try {
			const { id, role } = req.user;
			return apiResponse(
				{
					success: true,
					message: 'Authenticated user',
					code: 200,
					data: { id, role },
				},
				res,
			);
		} catch (error) {
			return apiResponse(
				{
					success: false,
					message: 'Unexpected error',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async passwordRecovery(req, res) {
		try {
			const parsed_data = passwordRecoverySchema.parse(req.body);

			await Auth.passwordRecovery(parsed_data);

			return apiResponse(
				{
					success: true,
					message: 'Password recovery email sent successfully',
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
						message: 'User does not exist',
						code: 404,
					},
					res,
				);
			}

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

	async resetPassword(req, res) {
		try {
			const parsed_data = resetPasswordSchema.parse({
				token: req.query.token,
				password: req.body.password,
			});

			await Auth.resetPassword(parsed_data);

			return apiResponse(
				{
					success: true,
					message: 'Password reset successfully',
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

			if (error.message === 'INVALID_TOKEN') {
				return apiResponse(
					{
						success: false,
						message: 'Token is invalid or has expired',
						code: 401,
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
