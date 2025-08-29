import { z } from '../utils/zod-with-openapi.js';
import { emailSchema, passwordSchema } from './generic.schema.js';
import { registry } from '../utils/register.js';

export const loginSchema = z
	.object({
		email: emailSchema,
		password: passwordSchema,
	})
	.openapi('loginSchema');

export const passwordRecoverySchema = z
	.object({
		email: emailSchema,
	})
	.openapi('passwordRecoverySchema');

export const resetPasswordSchema = z
	.object({
		token: z
			.string('token is required')
			.min(1, 'token cannot be empty')
			.openapi({ example: 'reset_token' }),
		password: passwordSchema,
	})
	.openapi('resetPasswordSchema');

registry.register('loginSchema', loginSchema);
registry.register('passwordRecoverySchema', passwordRecoverySchema);
registry.register('resetPasswordSchema', resetPasswordSchema);
