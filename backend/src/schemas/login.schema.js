import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email('Invalid e-mail'),
	password: z.string().min(6, 'Password must be at least 6 characters long.'),
});
