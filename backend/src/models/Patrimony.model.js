import prisma from '../config/prisma-client.js';

export class Patrimony {
	constructor({ id }) {
		this.id = id;
	}

	static async create({ name, location, code, description }) {
		try {
			const patrimony = await prisma.patrimony.create({
				data: { name, location, code, description },
				select: this._baseSelect,
			});

			return patrimony;
		} catch (error) {
			if (error.code === 'P2002') {
				throw new Error('CODE_ALREADY_EXISTS');
			}
			throw new Error(`Error creating patrimony: ${error}`);
		}
	}

	static async createMany(patrimonies) {
		try {
			const result = await prisma.$transaction(async (tx) => {
				const createdPatrimonies = [];

				// Verificar se todos os códigos são únicos
				const codes = patrimonies.map((p) => p.code);
				const uniqueCodes = new Set(codes);

				if (codes.length !== uniqueCodes.size) {
					throw new Error('DUPLICATE_CODES_IN_REQUEST');
				}

				// Verificar se algum código já existe no banco
				const existingPatrimonies = await tx.patrimony.findMany({
					where: { code: { in: codes } },
					select: { code: true },
				});

				if (existingPatrimonies.length > 0) {
					const existingCodes = existingPatrimonies.map(
						(p) => p.code,
					);
					const err = new Error('CODES_ALREADY_EXIST');
					err.existingCodes = existingCodes;
					throw err;
				}

				// Criar todos os patrimônios
				for (const patrimonyData of patrimonies) {
					const created = await tx.patrimony.create({
						data: patrimonyData,
						select: this._baseSelect,
					});
					createdPatrimonies.push(created);
				}

				return createdPatrimonies;
			});

			return result;
		} catch (error) {
			if (error.message === 'DUPLICATE_CODES_IN_REQUEST') throw error;
			if (error.message === 'CODES_ALREADY_EXIST') throw error;
			throw new Error(`Error creating patrimonies: ${error}`);
		}
	}

	static async findAll({ search = null } = {}) {
		try {
			const where = {};

			if (search) {
				where.OR = [
					{ name: { contains: search } },
					{ location: { contains: search } },
					{ code: { contains: search } },
					{ description: { contains: search } },
				];
			}

			const patrimonies = await prisma.patrimony.findMany({
				where,
				select: this._baseSelect,
				orderBy: { created_at: 'desc' },
			});

			return patrimonies;
		} catch (error) {
			throw new Error(`Error finding patrimonies: ${error}`);
		}
	}

	static async findByCode(code) {
		try {
			const patrimony = await prisma.patrimony.findUnique({
				where: { code },
				select: this._baseSelect,
			});

			if (!patrimony) throw new Error('NOT_FOUND');

			return patrimony;
		} catch (error) {
			if (error.message === 'NOT_FOUND') {
				throw error;
			}
			throw new Error(`Error finding patrimony by code: ${error}`);
		}
	}

	static async update(code, { name, location, description }) {
		try {
			const patrimony = await prisma.patrimony.update({
				where: { code },
				data: {
					...(name && { name }),
					...(location && { location }),
					...(description && { description }),
				},
				select: this._baseSelect,
			});

			return patrimony;
		} catch (error) {
			if (error.code === 'P2025') {
				throw new Error('NOT_FOUND');
			}
			if (error.code === 'P2002') {
				throw new Error('CODE_ALREADY_EXISTS');
			}
			throw new Error(`Error updating patrimony: ${error}`);
		}
	}

	static async delete(code) {
		try {
			// Verificar se há tickets associados
			const ticketsCount = await prisma.ticket.count({
				where: { patrimony_code: code },
			});

			if (ticketsCount > 0) {
				throw new Error('PATRIMONY_HAS_TICKETS');
			}

			return await prisma.patrimony.delete({
				where: { code },
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2025') {
				throw new Error('NOT_FOUND');
			}
			if (error.message === 'PATRIMONY_HAS_TICKETS') {
				throw error;
			}
			throw new Error(`Error deleting patrimony: ${error}`);
		}
	}

	static _baseSelect = {
		id: true,
		name: true,
		location: true,
		code: true,
		description: true,
		created_at: true,
		updated_at: true,
	};
}
