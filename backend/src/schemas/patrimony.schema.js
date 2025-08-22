import { z } from 'zod';

// Schema para validar código de patrimônio
export const codeSchema = z
	.string()
	.min(1, 'Code is required')
	.max(50, 'Code must be less than 50 characters')
	.trim();

// Schema para criar um patrimônio
export const createPatrimonySchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(255, 'Name must be less than 255 characters')
		.trim(),
	location: z
		.string()
		.min(1, 'Location is required')
		.max(255, 'Location must be less than 255 characters')
		.trim(),
	description: z
		.string()
		.min(1, 'Description is required')
		.max(5000, 'Description must be less than 5000 characters')
		.trim(),
});

// Schema para atualizar um patrimônio (todos os campos opcionais)
export const updatePatrimonySchema = z
	.object({
		name: z
			.string()
			.min(1, 'Name cannot be empty')
			.max(255, 'Name must be less than 255 characters')
			.trim()
			.optional(),
		location: z
			.string()
			.min(1, 'Location cannot be empty')
			.max(255, 'Location must be less than 255 characters')
			.trim()
			.optional(),
		code: codeSchema.optional(),
		description: z
			.string()
			.min(1, 'Description cannot be empty')
			.max(5000, 'Description must be less than 5000 characters')
			.trim()
			.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field must be provided for update',
	});

// Schema para criação em lote de patrimônios
export const createManyPatrimoniesSchema = z.object({
	patrimonies: z
		.array(createPatrimonySchema)
		.min(1, 'At least one patrimony is required')
		.max(100, 'Maximum 100 patrimonies can be created at once'),
});

// Schema para buscar patrimônios com filtros
export const findAllPatrimoniesSchema = z.object({
	includeInactive: z
		.string()
		.optional()
		.default('true')
		.transform((val) => val === 'true'),
	search: z
		.string()
		.max(255, 'Search term must be less than 255 characters')
		.trim()
		.optional()
		.nullable()
		.transform((val) => val || null),
});

export const patrimonyCodeParamsSchema = z.object({
	code: codeSchema,
});
