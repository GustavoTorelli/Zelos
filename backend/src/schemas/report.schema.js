import { z } from 'zod';

export const reportSchema = z.object({
	type: z.enum(['status', 'type', 'technician', 'list'], 'Type is required'),

	format: z.enum(['json', 'csv', 'pdf']).default('json'),

	startDate: z.iso.date().optional(),
	endDate: z.iso.date().optional(),

	status: z.enum(['pending', 'in_progress', 'completed']).optional(),

	categoryId: z.coerce.number().int().positive().optional(),

	technicianId: z.coerce.number().int().positive().optional(),
});
