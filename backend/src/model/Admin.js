import prisma from '../config/prisma-client.js';
import hashPassword from '../utils/hash-password.js';

async function createAdmin(name, email, password) {
	const hashedPassword = await hashPassword(password);
	return await prisma.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
			role: 'admin',
		},
	});
}

export { createAdmin };
