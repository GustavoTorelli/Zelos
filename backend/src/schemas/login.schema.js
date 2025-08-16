import { z } from 'zod';
import { emailSchema } from './generic.schema.js';

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(6, 'Password must be at least 6 characters long.'),
});
