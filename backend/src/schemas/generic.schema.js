import { z } from 'zod';

export const idSchema = z.coerce
	.number('Id must be a number')
	.positive('Id must be a positive number');

export const emailSchema = z
	.string()
	.trim()
	.check(z.email('Invalid email address'))
	.toLowerCase();

export const passwordSchema = z
	.string()
	.min(6, 'Password must be at least 6 characters long.');
