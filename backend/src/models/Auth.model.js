import prisma from '../config/prisma-client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * @class
 * @classdesc Represents authentication operations
 */
export class Auth {
	/**
	 * Logs a user in and returns a JWT token
	 * @param {{ email: string, password: string }} data - The data to log in with
	 * @returns {Promise<string>} A promise that resolves to the JWT token
	 * @throws {Error} If the user is not found or the password is invalid
	 */
	static async login({ email, password }) {
		const user = await prisma.user.findUnique({
			where: { email: email },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				is_active: true,
				hashed_password: true,
			},
		});

		if (!user) throw new Error('NOT_FOUND');
		if (!user.is_active) throw new Error('ACCOUNT_INACTIVE');

		const validPassword = await bcrypt.compare(
			password,
			user.hashed_password,
		);

		if (!validPassword) throw new Error('INVALID_PASSWORD');

		return jwt.sign(
			{
				id: user.id,
				role: user.role,
			},
			process.env.JWT_SECRET,
			{ expiresIn: '1d' },
		);
	}
}
