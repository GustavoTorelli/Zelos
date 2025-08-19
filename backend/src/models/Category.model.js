import prisma from '../config/prisma-client.js';

export class Category {
	/**
	 * Creates a new category
	 * @param {{ title: string, description: string, userId: number }} data - The data of the category to be created
	 * @returns {Promise<Object>} A promise that resolves to the newly created category object
	 * @throws {Error} If there is an error creating the category
	 */
	static async create({ title, description, userId, role }) {
		if (role !== 'admin') throw new Error('FORBIDDEN');

		try {
			return await prisma.category.create({
				data: {
					title,
					description,
					created_by: userId,
					updated_by: userId,
				},
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2002') throw new Error('ALREADY_EXISTS');
			throw new Error(`Error creating category: ${error}`);
		}
	}

	/**
	 * Finds all categories
	 * @param {Object} options - The options for finding categories
	 * @param {boolean} [options.includeInactive=false] - Whether to include inactive categories
	 * @returns {Promise<Array<Object>>} A promise that resolves to an array of categories
	 */
	static async findAll({ includeInactive = false }) {
		const where = includeInactive ? {} : { is_active: true };
		return await prisma.category.findMany({
			where,
			select: this._baseSelect,
		});
	}

	/**
	 * Finds a category by its ID
	 * @param {{ categoryId: number }} data - The data containing the category ID
	 * @returns {Promise<Object>} A promise that resolves to the category object
	 * @throws {Error} If the category is not found
	 */
	static async findById({ categoryId }) {
		const category = await prisma.category.findUnique({
			where: { id: categoryId },
			select: this._baseSelect,
		});
		if (!category) throw new Error('NOT_FOUND');
		return category;
	}

	/**
	 * Updates a category by ID
	 * @param {{ categoryId: number, data: Object, userId: number }} data - The data containing the category ID and the data to update the category with
	 * @returns {Promise<Object>} A promise that resolves to the updated category object
	 * @throws {Error} If the category is not found
	 * @throws {Error} If there is an error updating the category
	 */
	static async update({ categoryId, data, userId, role }) {
		if (role !== 'admin') throw new Error('FORBIDDEN');

		try {
			return await prisma.category.update({
				where: { id: categoryId },
				data: { ...data, updated_by: userId },
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2002') throw new Error('ALREADY_EXISTS');
			if (error.code === 'P2025') throw new Error('NOT_FOUND');
			throw new Error(`Error updating category: ${error}`);
		}
	}

	static async activate({ categoryId, userId, role }) {
		if (role !== 'admin') throw new Error('FORBIDDEN');

		try {
			return await prisma.category.update({
				where: { id: categoryId },
				data: { is_active: true, updated_by: userId },
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');
			throw new Error(`Error activating category: ${error}`);
		}
	}

	static async deactivate({ categoryId, userId, role }) {
		if (role !== 'admin') throw new Error('FORBIDDEN');

		try {
			return await prisma.category.update({
				where: { id: categoryId },
				data: { is_active: false, updated_by: userId },
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');
			throw new Error(`Error deactivating category: ${error}`);
		}
	}

	static _baseSelect = {
		id: true,
		title: true,
		description: true,
		is_active: true,
		created_at: true,
		updated_at: true,
		CreatedBy: {
			select: {
				id: true,
				name: true,
			},
		},
		UpdatedBy: {
			select: {
				id: true,
				name: true,
			},
		},
	};
}
