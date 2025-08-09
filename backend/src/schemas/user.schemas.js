import { z } from 'zod';

export const userCreateSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters long.'),
	email: z.email('Invalid email address.'),
	password: z.string().min(6, 'Password must be at least 6 characters long.'),
	role: z.enum(
		['user', 'admin', 'technician'],
		'Role must be user, admin or technician',
	),
});

export const userUpdateSchema = z.object({
	name: z
		.string()
		.min(3, 'Name must be at least 3 characters long.')
		.optional(),
	email: z.email('Invalid email address').optional(),
	password: z
		.string()
		.min(6, 'Password must be at least 6 characters long.')
		.optional(),
	role: z
		.enum(
			['user', 'admin', 'technician'],
			'Role must be user, admin or technician',
		)
		.optional(),
	is_active: z.boolean().optional(),
});
