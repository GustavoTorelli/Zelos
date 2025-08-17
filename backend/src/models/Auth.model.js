import prisma from '../config/prisma-client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../utils/mailer.js';
import hashPassword from '../utils/hash-password.js';

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
			where: { email },
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

	static async passwordRecovery({ email }) {
		try {
			const user = await prisma.user.findUnique({
				where: { email },
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					is_active: true,
				},
			});

			if (!user) throw new Error('NOT_FOUND');
			if (!user.is_active) throw new Error('ACCOUNT_INACTIVE');

			const token = crypto.randomBytes(32).toString('hex');
			const expires = Date.now() + 30 * 60 * 1000; // 30 min

			await prisma.user.update({
				where: { id: user.id },
				data: {
					reset_token: token,
					reset_token_expires: new Date(expires),
				},
			});

			await sendResetPasswordEmail(user.email, token);
		} catch (error) {
			if (error.message === 'NOT_FOUND') throw error;
			if (error.message === 'ACCOUNT_INACTIVE') throw error;

			throw new Error(`Error resetting password: ${error.message}`);
		}
	}

	static async resetPassword({ token, password }) {
		try {
			const user = await prisma.user.findFirst({
				where: {
					reset_token: token,
					reset_token_expires: { gt: new Date() },
				},
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					is_active: true,
				},
			});

			if (!user) throw new Error('INVALID_TOKEN');

			const hashed_password = await hashPassword(password);
			await prisma.user.update({
				where: { id: user.id },
				data: {
					hashed_password,
					reset_token: null,
					reset_token_expires: null,
				},
			});

			return;
		} catch (error) {
			if (error.message === 'INVALID_TOKEN') throw error;

			if (error.message === 'NOT_FOUND') throw error;

			throw new Error(`Error resetting password: ${error.message}`);
		}
	}
}
