import { z } from 'zod';
import { idSchema } from './generic.schema.js';

export const createTicket = z.object({
	title: z.string('Title is required').min(1, 'Title cannot be empty'),
	description: z
		.string('Description is required')
		.min(1, 'Description cannot be empty'),
	category_id: idSchema,
	patrimony_id: idSchema.optional(),
});

export const updateTicket = z.object({
	title: z.string().min(1, 'Title cannot be empty').optional(),
	description: z.string().min(1, 'Description cannot be empty').optional(),
	category_id: idSchema.optional(),
});

export const updateStatus = z.object({
	status: z.enum(
		['pending', 'in_progress', 'completed'],
		`Status must be 'pending', 'in_progress' or 'completed'`,
	),
});

export const assignTechnician = z
	.object({
		technician_id: idSchema,
	})
	.refine(
		(obj) => Object.keys(obj).length > 0,
		'At last one field is required',
	);
