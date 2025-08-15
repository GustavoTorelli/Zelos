import { Category } from '../models/Category.model.js';
import { createCategory, updateCategory } from '../schemas/category.schema.js';
import { idSchema } from '../schemas/generic.schema.js';
import apiResponse from '../utils/api-response.js';
import { ZodError } from 'zod';
import zodErrorFormatter from '../utils/zod-error-formatter.js';

export class CategoryController {
	constructor() {}

	async create(req, res) {
		try {
			const parsedData = createCategory.parse(req.body);

			const category = await Category.create({
				...parsedData,
				userId: req.user.id,
				role: req.user.role,
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

			if (error.message === 'FORBIDDEN') {
				return apiResponse(
					{
						code: 403,
						success: false,
						message: 'You are not allowed to perform this action',
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
			const includeInactive =
				req.query.includeInactive === 'true' ? true : false;

			const categories = await Category.findAll({
				includeInactive,
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
			const parsedId = idSchema.parse(req.params.id);
			const category = await Category.findById({ categoryId: parsedId });
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
			const parsedId = idSchema.parse(req.params.id);
			const parsedData = updateCategory.parse(req.body);

			const category = await Category.update({
				categoryId: parsedId,
				data: parsedData,
				userId: req.user.id,
				role: req.user.role,
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

			if (error.message === 'FORBIDDEN') {
				return apiResponse(
					{
						code: 403,
						success: false,
						message: 'You are not allowed to perform this action',
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

	async activate(req, res) {
		try {
			const parsedId = idSchema.parse(req.params.id);
			const category = await Category.activate({
				categoryId: parsedId,
				userId: req.user.id,
				role: req.user.role,
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
			if (error.message === 'FORBIDDEN') {
				return apiResponse(
					{
						code: 403,
						success: false,
						message: 'You are not allowed to perform this action',
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
			const parsedId = idSchema.parse(req.params.id);
			const category = await Category.deactivate({
				categoryId: parsedId,
				userId: req.user.id,
				role: req.user.role,
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
			if (error.message === 'FORBIDDEN') {
				return apiResponse(
					{
						code: 403,
						success: false,
						message: 'You are not allowed to perform this action',
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
