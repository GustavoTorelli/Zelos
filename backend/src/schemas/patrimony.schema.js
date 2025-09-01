import { z } from '../utils/zod-with-openapi.js';
import { registry } from '../utils/register.js';

export const codeSchema = registry.register(
	'codeSchema',
	z
		.string()
		.min(1, 'Code is required')
		.max(50, 'Code must be less than 50 characters')
		.trim()
		.openapi({ example: 'PAT-0001' }),
);

export const createPatrimonySchema = registry.register(
	'createPatrimonySchema',
	z.object({
		name: z
			.string()
			.min(1, 'Name is required')
			.max(255, 'Name must be less than 255 characters')
			.trim()
			.openapi({ example: 'Notebook Dell' }),
		location: z
			.string()
			.min(1, 'Location is required')
			.max(255, 'Location must be less than 255 characters')
			.trim()
			.openapi({ example: 'Sala 10 - Prédio A' }),
		description: z
			.string()
			.min(1, 'Description is required')
			.max(5000, 'Description must be less than 5000 characters')
			.trim()
			.openapi({
				example: 'Notebook usado pela equipe de desenvolvimento',
			}),
		code: codeSchema,
	}),
);

export const updatePatrimonySchema = registry.register(
	'updatePatrimonySchema',
	z
		.object({
			name: z
				.string()
				.min(1, 'Name cannot be empty')
				.max(255, 'Name must be less than 255 characters')
				.trim()
				.optional()
				.openapi({ example: 'Notebook Dell - i7' }),
			location: z
				.string()
				.min(1, 'Location cannot be empty')
				.max(255, 'Location must be less than 255 characters')
				.trim()
				.optional()
				.openapi({ example: 'Sala 10 - Prédio A' }),
			code: codeSchema.optional(),
			description: z
				.string()
				.min(1, 'Description cannot be empty')
				.max(5000, 'Description must be less than 5000 characters')
				.trim()
				.optional()
				.openapi({ example: 'Descrição atualizada do patrimônio' }),
		})
		.refine((data) => Object.keys(data).length > 0, {
			message: 'At least one field must be provided for update',
		}),
);

export const createManyPatrimoniesSchema = registry.register(
	'createManyPatrimoniesSchema',
	z
		.array(createPatrimonySchema)
		.min(1, 'At least one patrimony is required')
		.max(100, 'Maximum 100 patrimonies can be created at once'),
);

export const findAllPatrimoniesSchema = registry.register(
	'findAllPatrimoniesSchema',
	z.object({
		include_inactive: z
			.string()
			.optional()
			.default('true')
			.transform((val) => val === 'true')
			.openapi({ example: 'true' }),
		search: z
			.string()
			.max(255, 'Search term must be less than 255 characters')
			.trim()
			.optional()
			.nullable()
			.transform((val) => val || null)
			.openapi({ example: 'notebook' }),
	}),
);

export const patrimonyCodeParamsSchema = registry.register(
	'patrimonyCodeParamsSchema',
	z.object({
		code: codeSchema,
	}),
);
