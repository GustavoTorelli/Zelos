import prisma from '../config/prisma-client.js';
import hashPassword from '../utils/hash-password.js';

/**
 * @class
 * @classdesc Represents a user with static methods for CRUD operations and
 * instance methods for manipulating a specific user.
 */
export class User {
	/**
	 * Creates an instance of User.
	 * @param {Object} data - Data for the user instance.
	 * @param {number} data.id - The user's ID.
	 */
	constructor({ id }) {
		this.id = id;
	}

	/**
	 * Creates a new user
	 * @param {Object} data - The data of the user to be created
	 * @param {string} data.name - The name of the user
	 * @param {string} data.email - The email of the user
	 * @param {string} data.password - The password of the user
	 * @param {string} data.role - The role of the user
	 * @returns {Promise<Object>} A promise that resolves to the newly created user
	 * @throws {Error} If there is an error creating the user
	 */
	static async create({ name, email, password, role }) {
		try {
			const hashedPassword = await hashPassword(password);
			return await prisma.user.create({
				data: {
					name,
					email,
					hashed_password: hashedPassword,
					role,
				},
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					is_active: true,
					created_at: true,
					updated_at: true,
				},
			});
		} catch (error) {
			if (error.code === 'P2002') {
				throw new Error('EMAIL_ALREADY_EXISTS');
			}

			throw new Error(`Error creating user: ${error}`);
		}
	}

	/**
	 * Finds all users
	 * @returns {Promise<Array<Object>>} A promise that resolves to an array of users
	 * @throws {Error} If there is an error finding the users
	 */
	static async findAll() {
		try {
			return await prisma.user.findMany({
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					is_active: true,
					created_at: true,
					updated_at: true,
				},
			});
		} catch (error) {
			throw new Error(`Error finding users: ${error}`);
		}
	}

	/**
	 * Finds a user by ID
	 * @param {number} id - The ID of the user to find
	 * @returns {Promise<Object>} A promise that resolves to the user object if found
	 * @throws {Error} If the user is not found or there is an error finding the user
	 */
	static async find(id) {
		try {
			const user = await prisma.user.findUnique({
				where: {
					id,
				},
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					is_active: true,
					created_at: true,
					updated_at: true,
				},
			});

			if (!user) throw new Error('NOT_FOUND');

			return user;
		} catch (error) {
			if (error.message === 'NOT_FOUND') {
				throw error;
			}

			throw new Error(`Error finding user: ${error}`);
		}
	}

	/**
	 * Updates a user by ID
	 * @param {number} id - The ID of the user to update
	 * @param {{ name?: string, email?: string, password?: string, role?: string }} dataToUpdate - The data to update the user with
	 * @returns {Promise<Object>} A promise that resolves to the updated user object
	 * @throws {Error} If the user is not found or there is an error updating the user
	 */
	static async update(id, { name, email, password, role }) {
		try {
			const dataToUpdate = {
				...(name && { name }),
				...(email && { email }),
				...(password && {
					hashed_password: await hashPassword(password),
				}),
				...(role && { role }),
			};

			return await prisma.user.update({
				where: {
					id: id,
				},
				data: dataToUpdate,
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					is_active: true,
					created_at: true,
					updated_at: true,
				},
			});
		} catch (error) {
			if (error.code === 'P2025') {
				throw new Error('NOT_FOUND');
			}

			if (error.code === 'P2002') {
				throw new Error('EMAIL_ALREADY_EXISTS');
			}

			throw new Error(`Error updating user: ${error}`);
		}
	}

	/**
	 * Deletes a user by ID
	 * @param {number} id - The ID of the user to delete
	 * @returns {Promise<Object>} A promise that resolves to the deleted user object
	 * @throws {Error} If there is an error deleting the user
	 */
	static async delete(id) {
		try {
			return await prisma.user.delete({
				where: {
					id,
				},
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					is_active: true,
					created_at: true,
					updated_at: true,
				},
			});
		} catch (error) {
			if (error.code === 'P2025') {
				throw new Error('NOT_FOUND');
			}

			throw new Error(`Error deleting user: ${error}`);
		}
	}

	/**
	 * Sets the user as active
	 * @returns {Promise<User>} A promise that resolves to the updated user object.
	 * @throws {Error} If the user is not found or there is an error activating the user.
	 */
	async active() {
		try {
			return await prisma.user.update({
				where: {
					id: this.id,
				},
				data: {
					is_active: true,
				},
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					is_active: true,
					created_at: true,
					updated_at: true,
				},
			});
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');

			throw new Error(`Error activating user: ${error}`);
		}
	}

	/**
	 * Sets the user as inactive
	 * @returns {Promise<User>} A promise that resolves to the updated user object.
	 * @throws {Error} If the user is not found or there is an error deactivating the user.
	 */
	async deactivate() {
		try {
			return await prisma.user.update({
				where: {
					id: this.id,
				},
				data: {
					is_active: false,
				},
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					is_active: true,
					created_at: true,
					updated_at: true,
				},
			});
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');

			throw new Error(`Error deactivating user: ${error}`);
		}
	}
}
