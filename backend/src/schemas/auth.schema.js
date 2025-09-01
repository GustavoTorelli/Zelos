import { z } from '../utils/zod-with-openapi.js';
import { emailSchema, passwordSchema } from './generic.schema.js';
import { registry } from '../utils/register.js';

export const loginSchema = registry.register(
	'loginSchema',
	z.object({
		email: emailSchema,
		password: passwordSchema,
	}),
);

export const passwordRecoverySchema = registry.register(
	'passwordRecoverySchema',
	z.object({
		email: emailSchema,
	}),
);

export const resetPasswordSchema = registry.register(
	'resetPasswordSchema',
	z.object({
		token: z
			.string('token is required')
			.min(1, 'token cannot be empty')
			.openapi({ example: 'reset_token' }),
		password: passwordSchema,
	}),
);
