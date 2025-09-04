import { z } from '../utils/zod-with-openapi.js';
import { registry } from '../utils/register.js';
import { idSchema } from './generic.schema.js';

export const createTicketSchema = registry.register(
	'createTicketSchema',
	z.object({
		title: z
			.string('Title is required')
			.min(1, 'Title cannot be empty')
			.openapi({ example: 'Notebook não liga' }),
		description: z
			.string('Description is required')
			.min(1, 'Description cannot be empty')
			.openapi({
				example:
					'O notebook não está ligando após atualização do sistema. LED de energia não acende.',
			}),
		category_id: idSchema.openapi({
			example: 1,
			description: 'ID da categoria do ticket',
		}),
		patrimony_code: z.string().optional().openapi({
			example: '1234567',
			description: 'Código do patrimônio (opcional)',
		}),
	}),
);

export const updateTicketSchema = registry.register(
	'updateTicketSchema',
	z.object({
		title: z
			.string()
			.min(1, 'Title cannot be empty')
			.optional()
			.openapi({ example: 'Notebook Dell não liga - Atualizado' }),
		description: z
			.string()
			.min(1, 'Description cannot be empty')
			.optional()
			.openapi({
				example:
					'Descrição atualizada do problema com mais detalhes técnicos.',
			}),
		category_id: idSchema.optional().openapi({
			example: 2,
			description: 'Nova categoria do ticket',
		}),
	}),
);

export const updateStatusSchema = registry.register(
	'updateStatusSchema',
	z.object({
		status: z.enum(['pending', 'in_progress', 'completed']).openapi({
			example: 'in_progress',
			description:
				"Status do ticket: 'pending', 'in_progress' ou 'completed'",
		}),
	}),
);

export const findAllTicketSchema = registry.register(
	'findAllTicketSchema',
	z.object({
		status: z
			.enum(['pending', 'in_progress', 'completed'])
			.optional()
			.openapi({
				example: 'pending',
				description: 'Filtrar tickets por status',
			}),
		technician_id: idSchema.optional().openapi({
			example: 2,
			description: 'Filtrar tickets por técnico',
		}),
		category_id: idSchema.optional().openapi({
			example: 1,
			description: 'Filtrar tickets por categoria',
		}),
		patrimony_code: z.string().optional().openapi({
			example: '1234567',
			description: 'Filtrar tickets por código do patrimônio',
		}),
		created_after: z.iso.date().optional().openapi({
			example: '2025-09-01',
			description: 'Filtrar tickets criados após esta data',
		}),
		created_before: z.iso.date().optional().openapi({
			example: '2025-09-30',
			description: 'Filtrar tickets criados antes desta data',
		}),
	}),
);

export const assignTechnicianSchema = registry.register(
	'assignTechnicianSchema',
	z
		.object({
			technician_id: idSchema.openapi({
				example: 3,
				description: 'ID do técnico a ser atribuído',
			}),
		})
		.refine((data) => Object.keys(data).length > 0, {
			message: 'At least one field is required',
		}),
);
