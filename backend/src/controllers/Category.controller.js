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
			const parsed_data = createCategory.parse(req.body);

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
			const parsed_data = updateCategory.parse(req.body);

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
