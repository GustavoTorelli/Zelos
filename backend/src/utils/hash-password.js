import bcrypt from 'bcryptjs';

export default async function hashPassword(password) {
	try {
		const salt = await bcrypt.genSalt(10);
		return await bcrypt.hash(password, salt);
	} catch (error) {
		throw new Error('Error hashing password: ', error);
	}
}
