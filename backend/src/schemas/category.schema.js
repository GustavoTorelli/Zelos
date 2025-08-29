import { z } from 'zod';

export const createCategorySchema = z.object({
	title: z
		.string('Title is required')
		.min(1, 'Title cannot be empty')
		.trim()
		.toLowerCase(),
	description: z
		.string('Description is required')
		.min(1, 'Description cannot be empty')
		.trim(),
});

export const updateCategorySchema = z
	.object({
		title: z.string().min(1, 'Title cannot be empty').trim().optional(),
		description: z
			.string()
			.min(1, 'Description cannot be empty')
			.trim()
			.optional(),
	})
	.refine(
		(obj) => Object.keys(obj).length > 0,
		'At last one field is required',
	);
