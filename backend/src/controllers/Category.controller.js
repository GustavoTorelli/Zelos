import { Category } from '../models/Category.model.js';
import {
	createCategorySchema,
	updateCategorySchema,
} from '../schemas/category.schema.js';
import { idSchema } from '../schemas/generic.schema.js';
import apiResponse from '../utils/api-response.js';
import { ZodError } from 'zod';
import zodErrorFormatter from '../utils/zod-error-formatter.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "hardware"
 *         description:
 *           type: string
 *           example: "Category related to hardware requests"
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-31T18:22:10.123Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T10:00:00.000Z"
 *         CreatedBy:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 5
 *             name:
 *               type: string
 *               example: "Admin User"
 *         UpdatedBy:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 6
 *             name:
 *               type: string
 *               example: "Support User"
 *
 *   responses:
 *     CategoriesFound:
 *       description: Lista de categorias encontrada
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Categories found successfully"
 *             code: 200
 *             data:
 *               - id: 1
 *                 title: "hardware"
 *                 description: "Category related to hardware requests"
 *                 is_active: true
 *                 created_at: "2025-08-31T18:22:10.123Z"
 *                 updated_at: "2025-09-01T10:00:00.000Z"
 *                 CreatedBy:
 *                   id: 5
 *                   name: "Admin User"
 *                 UpdatedBy:
 *                   id: 6
 *                   name: "Support User"
 *               - id: 2
 *                 title: "software"
 *                 description: "Category related to software requests"
 *                 is_active: true
 *                 created_at: "2025-08-30T12:10:00.000Z"
 *                 updated_at: "2025-08-30T12:10:00.000Z"
 *                 CreatedBy:
 *                   id: 6
 *                   name: "Support User"
 *                 UpdatedBy:
 *                   id: 6
 *                   name: "Support User"
 *
 *     CategoryFound:
 *       description: Categoria encontrada
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Category found successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               title: "hardware"
 *               description: "Category related to hardware requests"
 *               is_active: true
 *               created_at: "2025-08-31T18:22:10.123Z"
 *               updated_at: "2025-09-01T10:00:00.000Z"
 *               CreatedBy:
 *                 id: 5
 *                 name: "Admin User"
 *               UpdatedBy:
 *                 id: 6
 *                 name: "Support User"
 *
 *     CategoryCreated:
 *       description: Categoria criada com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Category created successfully"
 *             code: 201
 *             data:
 *               id: 3
 *               title: "network"
 *               description: "Requests related to network issues"
 *               is_active: true
 *               created_at: "2025-09-02T09:00:00.000Z"
 *               updated_at: "2025-09-02T09:00:00.000Z"
 *               CreatedBy:
 *                 id: 7
 *                 name: "Operator"
 *               UpdatedBy:
 *                 id: 7
 *                 name: "Operator"
 *
 *     CategoryUpdated:
 *       description: Categoria atualizada com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Category updated successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               title: "hardware-updated"
 *               description: "Updated description"
 *               is_active: true
 *               created_at: "2025-08-31T18:22:10.123Z"
 *               updated_at: "2025-09-03T11:30:00.000Z"
 *               CreatedBy:
 *                 id: 5
 *                 name: "Admin User"
 *               UpdatedBy:
 *                 id: 8
 *                 name: "Editor"
 *
 *     CategoryDeleted:
 *       description: Categoria excluída com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Category 'hardware' deleted successfully"
 *             code: 200
 *             data: null
 *
 *     CategoryActivated:
 *       description: Categoria ativada com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Category activated successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               title: "hardware"
 *               description: "Category related to hardware requests"
 *               is_active: true
 *               created_at: "2025-08-31T18:22:10.123Z"
 *               updated_at: "2025-09-03T12:00:00.000Z"
 *               CreatedBy:
 *                 id: 5
 *                 name: "Admin User"
 *               UpdatedBy:
 *                 id: 8
 *                 name: "Editor"
 *
 *     CategoryDeactivated:
 *       description: Categoria desativada com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Category deactivated successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               title: "hardware"
 *               description: "Category related to hardware requests"
 *               is_active: false
 *               created_at: "2025-08-31T18:22:10.123Z"
 *               updated_at: "2025-09-03T12:15:00.000Z"
 *               CreatedBy:
 *                 id: 5
 *                 name: "Admin User"
 *               UpdatedBy:
 *                 id: 8
 *                 name: "Editor"
 *
 *     AlreadyExists:
 *       description: Categoria já existe
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Category already exists"
 *             code: 409
 *             data: null
 *
 *     NotFoundCategory:
 *       description: Categoria não encontrada
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Category not found"
 *             code: 404
 *             data: null
 *
 *     InvalidRequest:
 *       description: Erro de validação dos dados (Zod)
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Validation error"
 *             code: 400
 *             data: null
 *             errors:
 *               - path: ["title"]
 *                 message: "Title is required"
 *                 expected: undefined
 *               - path: ["description"]
 *                 message: "Description cannot be empty"
 *                 expected: undefined
 *
 *     UnauthorizedError:
 *       description: Falha de autenticação — token ausente ou inválido
 *       content:
 *         application/json:
 *           examples:
 *             missingToken:
 *               value:
 *                 success: false
 *                 message: "Authentication token not provided."
 *                 code: 401
 *                 data: null
 *             invalidToken:
 *               value:
 *                 success: false
 *                 message: "Invalid authentication token."
 *                 code: 401
 *                 data: null
 *                 errors: "jwt malformed"
 *
 *     ForbiddenError:
 *       description: Acesso negado — usuário autenticado sem permissão
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Access denied. You do not have permission to perform this action."
 *             code: 403
 *             data: null
 *
 *     ServerError:
 *       description: Erro inesperado do servidor
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "An unexpected error occurred"
 *             code: 500
 *             data: null
 *             errors: "Error details"
 */

export class CategoryController {
	constructor() {}

	async create(req, res) {
		try {
			const parsed_data = createCategorySchema.parse(req.body);

			const category = await Category.create({
				...parsed_data,
				user_id: req.user.id,
			});
			return apiResponse(
				{
					code: 201,
					success: true,
					message: 'Category created successfully',
					data: category,
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

			if (error.message === 'ALREADY_EXISTS') {
				return apiResponse(
					{
						code: 409,
						success: false,
						message: 'Category already exists',
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

	async findAll(req, res) {
		try {
			const include_inactive =
				req.query.include_inactive === 'true' ? true : false;

			const categories = await Category.findAll({
				include_inactive,
			});

			return apiResponse(
				{
					code: 200,
					success: true,
					message: 'Categories found successfully',
					data: categories,
				},
				res,
			);
		} catch (error) {
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

	async findById(req, res) {
		try {
			const parsed_id = idSchema.parse(req.params.id);
			const category = await Category.findById({
				category_id: parsed_id,
			});
			return apiResponse(
				{
					code: 200,
					success: true,
					message: 'Category found successfully',
					data: category,
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
						message: 'Category not found',
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

	async update(req, res) {
		try {
			const parsed_id = idSchema.parse(req.params.id);
			const parsed_data = updateCategorySchema.parse(req.body);

			const category = await Category.update({
				category_id: parsed_id,
				data: parsed_data,
				user_id: req.user.id,
			});

			return apiResponse(
				{
					code: 200,
					success: true,
					message: 'Category updated successfully',
					data: category,
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
						message: 'Category not found',
					},
					res,
				);
			}

			if (error.message === 'ALREADY_EXISTS') {
				return apiResponse(
					{
						code: 409,
						success: false,
						message: 'Category already exists',
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
			const parsed_id = idSchema.parse(req.params.id);
			const category_title = await Category.delete({
				category_id: parsed_id,
			});
			return apiResponse(
				{
					code: 200,
					success: true,
					message: `Category '${category_title}' deleted successfully`,
				},
				res,
			);
		} catch (error) {
			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						code: 404,
						success: false,
						message: 'Category not found',
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

	async activate(req, res) {
		try {
			const parsed_id = idSchema.parse(req.params.id);
			const category = await Category.activate({
				category_id: parsed_id,
				user_id: req.user.id,
			});
			return apiResponse(
				{
					code: 200,
					success: true,
					message: 'Category activated successfully',
					data: category,
				},
				res,
			);
		} catch (error) {
			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						code: 404,
						success: false,
						message: 'Category not found',
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

	async deactivate(req, res) {
		try {
			const parsed_id = idSchema.parse(req.params.id);
			const category = await Category.deactivate({
				category_id: parsed_id,
				user_id: req.user.id,
			});
			return apiResponse(
				{
					code: 200,
					success: true,
					message: 'Category deactivated successfully',
					data: category,
				},
				res,
			);
		} catch (error) {
			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						code: 404,
						success: false,
						message: 'Category not found',
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
}
