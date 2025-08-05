import prisma from '../config/prisma-client.js';
import hashPassword from '../utils/hash-password.js';

export class User {
	constructor({ id, name, email }) {
		this.id = id;
		this.name = name;
		this.email = email;
	}

	/**
	 * Creates a new user
	 * @param {Object} data - The data of the user to be created
	 * @param {string} data.name - The name of the user
	 * @param {string} data.email - The email of the user
	 * @param {string} data.password - The password of the user
	 * @param {string} data.role - The role of the user
	 * @returns {Promise<User>} A promise that resolves to the newly created user
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
			});
		} catch (error) {
			throw new Error(`Error creating user: ${error}`);
		}
	}

	/**
	 * Finds all users
	 * @returns {Promise<Array<User>>} A promise that resolves to an array of users
	 * @throws {Error} If there is an error finding the users
	 */
	static async findAll() {
		try {
			return await prisma.user.findMany();
		} catch (error) {
			throw new Error(`Error finding users: ${error}`);
		}
	}

	/**
	 * Finds a user by its ID
	 * @param {number} id - The ID of the user
	 * @returns {Promise<User | null>} A promise that resolves to the user if found, otherwise null
	 * @throws {Error} If there is an error finding the user
	 */
	static async find(id) {
		try {
			return await prisma.user.findUnique({
				where: {
					id,
				},
			});
		} catch (error) {
			throw new Error(`Error finding user: ${error}`);
		}
	}

	/**
	 * Updates a user
	 * @param {Object} data - The data of the user to be updated
	 * @param {number} data.id - The ID of the user
	 * @param {string} data.name - The name of the user
	 * @param {string} data.email - The email of the user
	 * @param {string} data.password - The password of the user
	 * @param {string} data.role - The role of the user
	 * @returns {Promise<User>} A promise that resolves to the updated user
	 * @throws {Error} If there is an error updating the user
	 */
	async update({ name, email, password, role }) {
		try {
			const hashedPassword = await hashPassword(password);
			return await prisma.user.update({
				where: {
					id: this.id,
				},
				data: {
					name,
					email,
					hashed_password: hashedPassword,
					role,
				},
			});
		} catch (error) {
			throw new Error(`Error updating user: ${error}`);
		}
	}

	/**
	 * Sets the user as active
	 * @param {Object} data - The data of the user to be activated
	 * @param {number} data.id - The ID of the user
	 * @returns {Promise<User>} A promise that resolves to the updated user
	 * @throws {Error} If there is an error activating the user
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
			});
		} catch (error) {
			throw new Error(`Error activating user: ${error}`);
		}
	}

	/**
	 * Sets the user as inactive
	 * @param {Object} data - The data of the user to be deactivated
	 * @param {number} data.id - The ID of the user
	 * @returns {Promise<User>} A promise that resolves to the updated user
	 * @throws {Error} If there is an error deactivating the user
	 */
	async disable() {
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
				},
			});
		} catch (error) {
			throw new Error(`Error deactivating user: ${error}`);
		}
	}
}
