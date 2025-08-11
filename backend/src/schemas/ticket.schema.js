import { z } from 'zod';
import { idSchema } from './generic.schema.js';

export const createTicket = z.object({
	title: z.string('Title is required'),
	description: z.string('Description is required'),
	user_id: idSchema('User ID is required'),
	category_id: idSchema('Category ID is required'),
	patrimony_id: idSchema().optional(),
});
