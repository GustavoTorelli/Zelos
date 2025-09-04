import { z } from '../utils/zod-with-openapi.js';
import { registry } from '../utils/register.js';
import { idSchema } from './generic.schema.js';

export const createWorklogSchema = registry.register(
	'createWorklogSchema',
	z.object({
		ticket_id: idSchema.openapi({
			example: 1,
			description: 'ID do ticket',
		}),
		description: z
			.string('Description is required')
			.min(1, 'Description cannot be empty')
			.openapi({
				example:
					'Realizei diagnóstico inicial. Identificado problema na fonte de alimentação. Solicitando peça de reposição.',
			}),
	}),
);

export const findAllWorklogSchema = registry.register(
	'findAllWorklogSchema',
	z.object({
		ticketId: idSchema.optional().openapi({
			example: 1,
			description: 'Filtrar worklogs por ticket',
		}),
		technician_id: idSchema.optional().openapi({
			example: 2,
			description: 'Filtrar worklogs por técnico',
		}),
	}),
);
