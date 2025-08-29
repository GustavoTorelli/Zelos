import { z } from 'zod';
import { idSchema } from './generic.schema.js';

export const createTicketSchema = z.object({
	title: z.string('Title is required').min(1, 'Title cannot be empty'),
	description: z
		.string('Description is required')
		.min(1, 'Description cannot be empty'),
	category_id: idSchema,
	patrimony_code: z.string().optional(),
});

export const updateTicketSchema = z.object({
	title: z.string().min(1, 'Title cannot be empty').optional(),
	description: z.string().min(1, 'Description cannot be empty').optional(),
	category_id: idSchema.optional(),
});

export const updateStatusSchema = z.object({
	status: z.enum(
		['pending', 'in_progress', 'completed'],
		`Status must be 'pending', 'in_progress' or 'completed'`,
	),
});

export const findAllTicketSchema = z.object({
	status: z
		.enum(
			['pending', 'in_progress', 'completed'],
			`Status must be 'pending', 'in_progress' or 'completed'`,
		)
		.optional(),
	technician_id: idSchema.optional(),
	category_id: idSchema.optional(),
	patrimony_code: z.string().optional(),
	created_after: z.iso.date('Date must be in YYYY-MM-DD format').optional(),
	created_before: z.iso.date('Date must be in YYYY-MM-DD format').optional(),
});

export const assignTechnicianSchema = z
	.object({
		technician_id: idSchema,
	})
	.refine(
		(obj) => Object.keys(obj).length > 0,
		'At last one field is required',
	);
