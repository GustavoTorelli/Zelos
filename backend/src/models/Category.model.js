import prisma from '../config/prisma-client.js';

export class Category {
	static async create({ title, description, user_id, role }) {
		if (role !== 'admin') throw new Error('FORBIDDEN');

		try {
			return await prisma.category.create({
				data: {
					title,
					description,
					created_by: user_id,
					updated_by: user_id,
				},
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2002') throw new Error('ALREADY_EXISTS');
			throw new Error(`Error creating category: ${error}`);
		}
	}

	static async findAll({ include_inactive = false }) {
		const where = include_inactive ? {} : { is_active: true };
		return await prisma.category.findMany({
			where,
			select: this._baseSelect,
		});
	}

	static async findById({ category_id }) {
		const category = await prisma.category.findUnique({
			where: { id: category_id },
			select: this._baseSelect,
		});
		if (!category) throw new Error('NOT_FOUND');
		return category;
	}

	static async update({ category_id, data, user_id, role }) {
		if (role !== 'admin') throw new Error('FORBIDDEN');

		try {
			return await prisma.category.update({
				where: { id: category_id },
				data: { ...data, updated_by: user_id },
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2002') throw new Error('ALREADY_EXISTS');
			if (error.code === 'P2025') throw new Error('NOT_FOUND');
			throw new Error(`Error updating category: ${error}`);
		}
	}

	static async delete({ category_id, role }) {
		if (role !== 'admin') throw new Error('FORBIDDEN');

		try {
			const category = await prisma.category.delete({
				where: { id: category_id },
			});
			return category.title;
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');
			throw new Error(`Error fetching category name: ${error}`);
		}
	}

	static async activate({ category_id, user_id, role }) {
		if (role !== 'admin') throw new Error('FORBIDDEN');

		try {
			return await prisma.category.update({
				where: { id: category_id },
				data: { is_active: true, updated_by: user_id },
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');
			throw new Error(`Error activating category: ${error}`);
		}
	}

	static async deactivate({ category_id, user_id, role }) {
		if (role !== 'admin') throw new Error('FORBIDDEN');

		try {
			return await prisma.category.update({
				where: { id: category_id },
				data: { is_active: false, updated_by: user_id },
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
