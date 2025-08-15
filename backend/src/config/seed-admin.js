import { ZodError } from 'zod';
import prisma from './prisma-client.js';
import hashPassword from '../utils/hash-password.js';
import { emailSchema } from '../schemas/generic.schema.js';

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
				email: emailSchema.parse(process.env.ADMIN_EMAIL),
				hashed_password: hashedPassword,
				role: 'admin',
				is_active: true,
			};

			await prisma.user.create({
				data: adminData,
			});
			console.log(
				`Admin user created with credentials:\nemail: ${adminData.email} | password: ${process.env.ADMIN_PASSWORD}`,
			);
		}
	} catch (error) {
		if (error instanceof ZodError) {
			console.log('Error seeding admin: Invalid email address');
			return;
		}

		console.error('Error seeding admin:', error);
	}
}
