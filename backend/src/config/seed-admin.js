import { z, ZodError } from 'zod';
import prisma from './prisma-client.js';
import hashPassword from '../utils/hash-password.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';

export default async function seedAdmin() {
	try {
		const adminExist = await prisma.user.findFirst({
			where: { role: 'admin' },
		});

		if (!adminExist) {
			const hashedPassword = await hashPassword(
				process.env.ADMIN_PASSWORD,
			);

			const adminData = {
				name: 'admin',
				email: z.email().parse(process.env.ADMIN_EMAIL),
				hashed_password: hashedPassword,
				role: 'admin',
				is_active: true,
			};

			await prisma.user.create({
				data: adminData,
			});
			console.log(
				`Admin user created with credentials: ${process.env.ADMIN_EMAIL} | ${process.env.ADMIN_PASSWORD}`,
			);
		}
	} catch (error) {
		if (error instanceof ZodError) {
			console.log(
				'Error seeding admin: Invalid request data',
				zodErrorFormatter(error),
			);
		}

		console.error('Error seeding admin:', error);
	}
}
