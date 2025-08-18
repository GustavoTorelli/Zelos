import z from 'zod';
import { idSchema } from './generic.schema';

export const createWorklogSchema = z.object({
	ticket_id: idSchema,
	description: z
		.string('Description is required')
		.min(1, 'Description cannot be empty'),
});

export const findAllWorklogSchema = z.object({
	ticket_id: idSchema.optional(),
	technician_id: idSchema.optional(),
});
