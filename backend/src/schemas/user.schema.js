import { z } from '../utils/zod-with-openapi.js';
import { registry } from '../utils/register.js';
import { emailSchema, idSchema } from './generic.schema.js';

export const userCreateSchema = registry.register(
	'userCreateSchema',
	z.object({
		name: z
			.string()
			.min(3, 'Name must be at least 3 characters long')
			.openapi({ example: 'João Silva' }),
		email: emailSchema,
		password: z
			.string()
			.min(6, 'Password must be at least 6 characters long')
			.openapi({ example: 'senha123' }),
		role: z.enum(['user', 'admin', 'technician']).openapi({
			example: 'technician',
			description: "Role must be 'user', 'admin' or 'technician'",
		}),
		categories: z
			.array(idSchema)
			.optional()
			.openapi({
				example: [1, 2, 3],
				description: 'Array of category IDs (only for technicians)',
			}),
	}),
);

export const userUpdateSchema = registry.register(
	'userUpdateSchema',
	z
		.object({
			name: z
				.string()
				.min(3, 'Name must be at least 3 characters long')
				.optional()
				.openapi({ example: 'João Silva Santos' }),
			email: emailSchema.optional(),
			password: z
				.string()
				.min(6, 'Password must be at least 6 characters long')
				.optional()
				.openapi({ example: 'novaSenha123' }),
			role: z
				.enum(['user', 'admin', 'technician'])
				.optional()
				.openapi({ example: 'admin' }),
			is_active: z.boolean().optional().openapi({ example: true }),
			categories: z
				.array(idSchema)
				.optional()
				.openapi({
					example: [1, 4, 5],
					description: 'Array of category IDs (only for technicians)',
				}),
		})
		.refine((data) => Object.keys(data).length > 0, {
			message: 'At least one field is required',
		}),
);

export const userFilterSchema = registry.register(
	'userFilterSchema',
	z.object({
		include_inactive: z
			.enum(['true', 'false'])
			.optional()
			.transform((val) => val === 'true')
			.openapi({
				example: 'false',
				description: 'Include inactive users in results',
			}),
		role: z.enum(['user', 'admin', 'technician']).optional().openapi({
			example: 'technician',
			description: 'Filter users by role',
		}),
		category_id: z
			.string()
			.optional()
			.transform((val) => (val ? parseInt(val) : undefined))
			.openapi({
				example: '1',
				description: 'Filter technicians by category ID',
			}),
	}),
);
