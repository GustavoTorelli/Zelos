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
<<<<<<< HEAD
	constructor() { }

	async login(req, res) {
		try {
			const parsedData = loginSchema.parse(req.body);
			const token = await Auth.login(parsedData);
=======
	constructor() {}

	async login(req, res) {
		try {
			// Parse the request body using the loginSchema
			const parsed_data = loginSchema.parse(req.body);
			// Login the user and return a 200 response with the JWT token
			const token = await Auth.login(parsed_data);
>>>>>>> origin/backend-develop

			// Define cookie HTTP-only
			res.cookie('jwt_token', token, {
				httpOnly: true,
				maxAge: 24 * 60 * 60 * 1000, // 1 dia
				sameSite: 'lax',
			});

<<<<<<< HEAD
			// Retorna token sempre
			const responseData = {
=======
			const response_data = {
>>>>>>> origin/backend-develop
				success: true,
				message: 'Logged in successfully',
				code: 200,
				data: { token },
			};

<<<<<<< HEAD
			return apiResponse(responseData, res);
=======
			if (process.env.ENVIRONMENT === 'dev') {
				response_data.data = { token };
			}

			return apiResponse(response_data, res);
>>>>>>> origin/backend-develop
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
