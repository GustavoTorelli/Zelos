import { z } from '../utils/zod-with-openapi.js';
import { registry } from '../utils/register.js';

export const idSchema = z.coerce
	.number('Id must be a number')
	.positive('Id must be a positive number')
	.openapi({ example: 1 });

export const emailSchema = z
	.string()
	.trim()
	.check(z.email('Invalid email address'))
	.toLowerCase()
	.openapi({ example: 'user@email.com' });

export const passwordSchema = z
	.string()
	.min(6, 'Password must be at least 6 characters long.')
	.openapi({ example: 'Strong_password123' });

registry.register('idSchema', idSchema);
registry.register('emailSchema', emailSchema);
registry.register('passwordSchema', passwordSchema);
