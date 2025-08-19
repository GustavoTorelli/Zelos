import z from 'zod';
import { idSchema } from './generic.schema.js';

export const createWorklogSchema = z.object({
	ticketId: idSchema,
	description: z
		.string('Description is required')
		.min(1, 'Description cannot be empty'),
});

export const findAllWorklogSchema = z.object({
	ticketId: idSchema.optional(),
	technicianId: idSchema.optional(),
});
