import { z } from 'zod';
import { idSchema } from './generic.schema.js';

export const createTicket = z.object({
	title: z.string('Title is required'),
	description: z.string('Description is required'),
	category_id: idSchema('Category ID is required'),
	patrimony_id: idSchema().optional(),
});

export const updateTicket = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	category_id: idSchema().optional(),
});
