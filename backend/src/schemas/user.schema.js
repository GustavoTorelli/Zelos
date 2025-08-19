import { z } from 'zod';
import { emailSchema, idSchema } from './generic.schema.js';

export const userCreateSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters long'),
	email: emailSchema,
	password: z.string().min(6, 'Password must be at least 6 characters long'),
	role: z.enum(
		['user', 'admin', 'technician'],
		`Role must be 'user', 'admin' or 'technician'`,
	),
	categories: z.array(idSchema).optional(),
});

export const userUpdateSchema = z
	.object({
		name: z
			.string()
			.min(3, 'Name must be at least 3 characters long')
			.optional(),
		email: emailSchema.optional(),
		password: z
			.string()
			.min(6, 'Password must be at least 6 characters long')
			.optional(),
		role: z
			.enum(
				['user', 'admin', 'technician'],
				`Role must be 'user', 'admin' or 'technician'`,
			)
			.optional(),
		is_active: z.boolean().optional(),
		categories: z.array(idSchema).optional(),
	})
	.refine(
		(obj) => Object.keys(obj).length > 0,
		'At least one field is required',
	);
