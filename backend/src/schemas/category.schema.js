import { z } from '../utils/zod-with-openapi.js';
import { registry } from '../utils/register.js';

export const createCategorySchema = registry.register(
	'createCategorySchema',
	z.object({
		title: z
			.string('Title is required')
			.min(1, 'Title cannot be empty')
			.trim()
			.toLowerCase()
			.openapi({ example: 'hardware' }),
		description: z
			.string('Description is required')
			.min(1, 'Description cannot be empty')
			.trim()
			.openapi({ example: 'Category related to hardware requests' }),
	}),
);

export const updateCategorySchema = registry.register(
	'updateCategorySchema',
	z
		.object({
			title: z
				.string()
				.min(1, 'Title cannot be empty')
				.trim()
				.optional()
				.openapi({ example: 'updated title' }),
			description: z
				.string()
				.min(1, 'Description cannot be empty')
				.trim()
				.optional()
				.openapi({ example: 'updated description' }),
		})
		.refine(
			(obj) => Object.keys(obj).length > 0,
			'At least one field is required',
		),
);
