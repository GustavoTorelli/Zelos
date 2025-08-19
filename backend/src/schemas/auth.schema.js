import { z } from 'zod';
import { emailSchema, passwordSchema } from './generic.schema.js';

export const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});

export const passwordRecoverySchema = z.object({
	email: emailSchema,
});

export const resetPasswordSchema = z.object({
	token: z.string('token is required').min(1, 'token cannot be empty'),
	password: passwordSchema,
});
