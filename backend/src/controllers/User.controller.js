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

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao.silva@empresa.com"
 *         role:
 *           type: string
 *           enum: [user, admin, technician]
 *           example: "technician"
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-02T09:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-03T12:15:00.000Z"
 *         Technician_Category:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               Category:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Hardware"
 *           example:
 *             - Category:
 *                 id: 1
 *                 title: "Hardware"
 *             - Category:
 *                 id: 2
 *                 title: "Software"
 *
 *   examples:
 *     UserValidationErrors:
 *       summary: Erro de validação dos dados de usuário
 *       value:
 *         success: false
 *         message: "Validation error"
 *         code: 400
 *         data: null
 *         errors:
 *           - path: ["name"]
 *             message: "Name must be at least 3 characters long"
 *             expected: undefined
 *
 *     CategoriesOnlyForTechnicians:
 *       summary: Categorias podem ser atribuídas apenas a técnicos
 *       value:
 *         success: false
 *         message: "Categories can only be assigned to technicians"
 *         code: 400
 *         data: null
 *
 *     InvalidCategories:
 *       summary: Categorias inválidas ou inativas
 *       value:
 *         success: false
 *         message: "Some categories are invalid or inactive"
 *         code: 422
 *         data: null
 *         errors:
 *           invalid: [99, 100]
 *           inactive: [2, 5]
 *
 *   responses:
 *     UsersFound:
 *       description: Lista de usuários encontrada
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Users found successfully"
 *             code: 200
 *             data:
 *               - id: 1
 *                 name: "João Silva"
 *                 email: "joao.silva@empresa.com"
 *                 role: "technician"
 *                 is_active: true
 *                 created_at: "2025-09-02T09:00:00.000Z"
 *                 updated_at: "2025-09-03T12:15:00.000Z"
 *                 Technician_Category:
 *                   - Category:
 *                       id: 1
 *                       title: "Hardware"
 *
 *     UserFound:
 *       description: Usuário encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "User found Successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               name: "João Silva"
 *               email: "joao.silva@empresa.com"
 *               role: "technician"
 *               is_active: true
 *               created_at: "2025-09-02T09:00:00.000Z"
 *               updated_at: "2025-09-03T12:15:00.000Z"
 *               Technician_Category:
 *                 - Category:
 *                     id: 1
 *                     title: "Hardware"
 *
 *     UserCreated:
 *       description: Usuário criado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "User created successfully"
 *             code: 201
 *             data:
 *               id: 3
 *               name: "Maria Santos"
 *               email: "maria.santos@empresa.com"
 *               role: "user"
 *               is_active: true
 *               created_at: "2025-09-04T08:00:00.000Z"
 *               updated_at: "2025-09-04T08:00:00.000Z"
 *               Technician_Category: []
 *
 *     UserUpdated:
 *       description: Usuário atualizado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "User updated successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               name: "João Silva Santos"
 *               email: "joao.silva@empresa.com"
 *               role: "admin"
 *               is_active: true
 *               created_at: "2025-09-02T09:00:00.000Z"
 *               updated_at: "2025-09-05T10:00:00.000Z"
 *               Technician_Category: []
 *
 *     UserDeleted:
 *       description: Usuário deletado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "User deleted successfully"
 *             code: 200
 *             data: null
 *
 *     UserActivated:
 *       description: Usuário ativado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "User account has been activated"
 *             code: 200
 *             data:
 *               id: 1
 *               name: "João Silva"
 *               email: "joao.silva@empresa.com"
 *               role: "user"
 *               is_active: true
 *               created_at: "2025-09-02T09:00:00.000Z"
 *               updated_at: "2025-09-05T10:00:00.000Z"
 *               Technician_Category: []
 *
 *     UserDeactivated:
 *       description: Usuário desativado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "User account has been deactivated"
 *             code: 200
 *             data:
 *               id: 1
 *               name: "João Silva"
 *               email: "joao.silva@empresa.com"
 *               role: "user"
 *               is_active: false
 *               created_at: "2025-09-02T09:00:00.000Z"
 *               updated_at: "2025-09-05T10:00:00.000Z"
 *               Technician_Category: []
 *
 *     EmailAlreadyExists:
 *       description: Email já existe no sistema
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Email already exists"
 *             code: 409
 *             data: null
 *
 *     NotFoundUser:
 *       description: Usuário não encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "User not found"
 *             code: 404
 *             data: null
 *
 *     InvalidUserData:
 *       description: Erro de validação dos dados do usuário
 *       content:
 *         application/json:
 *           examples:
 *             validationErrors:
 *               $ref: '#/components/examples/UserValidationErrors'
 *             categoriesOnlyForTechnicians:
 *               $ref: '#/components/examples/CategoriesOnlyForTechnicians'
 *             invalidCategories:
 *               $ref: '#/components/examples/InvalidCategories'
 *
 *     UnauthorizedUserAccess:
 *       description: Acesso negado — usuário sem permissão para acessar este recurso
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "You are not authorized to access this resource"
 *             code: 403
 *             data: null
 */
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
