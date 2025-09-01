import { z } from '../utils/zod-with-openapi.js';
import { registry } from '../utils/register.js';

export const reportSchema = registry.register(
	'reportSchema',
	z.object({
		type: z
			.enum(['status', 'type', 'technician', 'list'], 'Type is required')
			.openapi({
				example: 'status',
				description: 'Tipo de relatório a ser gerado',
			}),
		format: z.enum(['json', 'csv', 'pdf']).default('json').openapi({
			example: 'json',
			description: 'Formato de saída do relatório',
		}),
		start_date: z.iso.date().optional().openapi({
			example: '2025-01-01',
			description: 'Data inicial para filtrar os dados',
		}),
		end_date: z.iso.date().optional().openapi({
			example: '2025-12-31',
			description: 'Data final para filtrar os dados',
		}),
		status: z
			.enum(['pending', 'in_progress', 'completed'])
			.optional()
			.openapi({
				example: 'pending',
				description: 'Filtrar por status específico',
			}),
		category_id: z.coerce.number().int().positive().optional().openapi({
			example: 1,
			description: 'ID da categoria para filtrar',
		}),
		technician_id: z.coerce.number().int().positive().optional().openapi({
			example: 5,
			description: 'ID do técnico para filtrar',
		}),
	}),
);
