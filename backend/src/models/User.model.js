import prisma from '../config/prisma-client.js';
import hashPassword from '../utils/hash-password.js';

export class User {
	constructor({ id }) {
		this.id = id;
	}

	static async create({ name, email, password, role, categories = [] }) {
		try {
			const user = await prisma.$transaction(async (tx) => {
				// if categories are provided, role must be technician
				const cats = Array.from(new Set(categories || []));
				if (cats.length && role !== 'technician') {
					throw new Error('ROLE_NOT_TECHNICIAN');
				}

				// check if categories are valid and active
				if (role === 'technician' && cats.length) {
					const rows = await tx.category.findMany({
						where: { id: { in: cats } },
						select: { id: true, is_active: true },
					});

					const foundIds = new Set(rows.map((r) => r.id));
					const inactiveIds = rows
						.filter((r) => !r.is_active)
						.map((r) => r.id);
					const invalidIds = cats.filter((id) => !foundIds.has(id));

					if (invalidIds.length || inactiveIds.length) {
						const err = new Error('INVALID_CATEGORIES');
						err.invalidCategories = invalidIds;
						err.inactiveCategories = inactiveIds;
						throw err;
					}
				}

				// create user
				const hashed = await hashPassword(password);
				const created = await tx.user.create({
					data: { name, email, hashed_password: hashed, role },
				});

				// create relations if role is technician
				if (role === 'technician' && cats.length) {
					await tx.technician_Category.createMany({
						data: cats.map((category_id) => ({
							technician_id: created.id,
							category_id,
						})),
						skipDuplicates: true,
					});
				}

				// return user
				return tx.user.findUnique({
					where: { id: created.id },
					select: {
						...this._baseSelect,
						Technician_Category: {
							select: {
								Category: { select: { id: true, title: true } },
							},
						},
					},
				});
			});

			return user;
		} catch (error) {
			if (error.message === 'ROLE_NOT_TECHNICIAN') throw error;
			if (error.message === 'INVALID_CATEGORIES') throw error;
			if (error.code === 'P2002') throw new Error('EMAIL_ALREADY_EXISTS');
			throw new Error(`Error creating user: ${error}`);
		}
	}

	static async findAll({ include_inactive = false, role }) {
		const where = {};

		if (!include_inactive) {
			where.is_active = true;
		}

		if (role) {
			where.role = role;
		}

		return await prisma.user.findMany({
			where,
			select: this._baseSelect,
		});
	}

	static async find(id) {
		try {
			const user = await prisma.user.findUnique({
				where: {
					id,
				},
				select: this._baseSelect,
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

	static async update(id, { name, email, password, role, categories }) {
		try {
			const updated = await prisma.$transaction(async (tx) => {
				// check if user exists
				const current = await tx.user.findUnique({
					where: { id },
					select: { id: true, role: true },
				});
				if (!current) throw new Error('NOT_FOUND');

				// check if new role is provided
				const newRole = role ?? current.role;

				// check if categories are valid and active
				let cats;
				const categoriesProvided = typeof categories !== 'undefined';
				if (categoriesProvided) {
					if (newRole !== 'technician') {
						throw new Error('ROLE_NOT_TECHNICIAN');
					}

					cats = Array.from(new Set(categories || []));
					if (cats.length) {
						const rows = await tx.category.findMany({
							where: { id: { in: cats } },
							select: { id: true, is_active: true },
						});

						const foundIds = new Set(rows.map((r) => r.id));
						const inactiveIds = rows
							.filter((r) => !r.is_active)
							.map((r) => r.id);
						const invalidIds = cats.filter(
							(id) => !foundIds.has(id),
						);

						if (invalidIds.length || inactiveIds.length) {
							const err = new Error('INVALID_CATEGORIES');
							err.invalidCategories = invalidIds;
							err.inactiveCategories = inactiveIds;
							throw err;
						}
					}
				}

				// update user
				const dataToUpdate = {
					...(name && { name }),
					...(email && { email }),
					...(password && {
						hashed_password: await hashPassword(password),
					}),
					role: newRole,
				};
				await tx.user.update({ where: { id }, data: dataToUpdate });

				// update relations
				if (newRole === 'technician') {
					if (categoriesProvided) {
						// if categories were provided, remove old and add new
						await tx.technician_Category.deleteMany({
							where: { technician_id: id },
						});
						if (cats.length) {
							await tx.technician_Category.createMany({
								data: cats.map((category_id) => ({
									category_id,
									technician_id: id,
								})),
								skipDuplicates: true,
							});
						}
					}
				} else {
					// else (is no longer a technician), only remove all categories
					await tx.technician_Category.deleteMany({
						where: { technician_id: id },
					});
				}

				// return user
				return tx.user.findUnique({
					where: { id },
					select: this._baseSelect,
				});
			});

			return updated;
		} catch (error) {
			if (error.message === 'NOT_FOUND') throw error;
			if (error.message === 'ROLE_NOT_TECHNICIAN') throw error;
			if (error.message === 'INVALID_CATEGORIES') throw error;
			if (error.code === 'P2002') throw new Error('EMAIL_ALREADY_EXISTS');
			throw new Error(`Error updating user: ${error}`);
		}
	}

	static async delete(id) {
		try {
			return await prisma.user.delete({
				where: {
					id,
				},
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2025') {
				throw new Error('NOT_FOUND');
			}

			throw new Error(`Error deleting user: ${error}`);
		}
	}

	async active() {
		try {
			return await prisma.user.update({
				where: {
					id: this.id,
				},
				data: {
					is_active: true,
				},
				select: User._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');

			throw new Error(`Error activating user: ${error}`);
		}
	}

	async deactivate() {
		try {
			return await prisma.user.update({
				where: {
					id: this.id,
				},
				data: {
					is_active: false,
				},
				select: User._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');

			throw new Error(`Error deactivating user: ${error}`);
		}
	}

	static _baseSelect = {
		id: true,
		name: true,
		email: true,
		role: true,
		is_active: true,
		created_at: true,
		updated_at: true,
		Technician_Category: {
			select: {
				Category: { select: { id: true, title: true } },
			},
		},
	};
}
