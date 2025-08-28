import { z } from 'zod';

export const reportSchema = z.object({
	type: z.enum(['status', 'type', 'technician', 'list'], 'Type is required'),

	format: z.enum(['json', 'csv', 'pdf']).default('json'),

	start_date: z.iso.date().optional(),
	end_date: z.iso.date().optional(),

	status: z.enum(['pending', 'in_progress', 'completed']).optional(),

	category_id: z.coerce.number().int().positive().optional(),

	technician_id: z.coerce.number().int().positive().optional(),
});
