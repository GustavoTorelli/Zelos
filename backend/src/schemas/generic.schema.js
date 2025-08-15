import { z } from 'zod';

export const idSchema = z.coerce
	.number('Id must be a number')
	.positive('Id must be a positive number');

export const emailSchema = z
	.string()
	.trim()
	.check(z.email('Invalid email address'))
	.toLowerCase();
