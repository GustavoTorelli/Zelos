import prisma from '../config/prisma-client.js';

export class Ticket {
	constructor({ id }) {
		this.id = id;
	}

	static async create({
		title,
		description,
		category_id,
		patrimony_code,
		user_id,
	}) {
		try {
			let patrimony = null;
			if (patrimony_code) {
				patrimony = await prisma.patrimony.findUnique({
					where: { code: patrimony_code },
				});

				if (!patrimony) throw new Error('PATRIMONY_NOT_FOUND');

				const existing = await prisma.ticket.findFirst({
					where: {
						patrimony_code: patrimony.code,
						category_id,
						status: { not: 'completed' },
					},
				});

				if (existing) throw new Error('DUPLICATED_TICKET');
			}

			return await prisma.ticket.create({
				data: {
					title,
					description,
					category_id,
					patrimony_code: patrimony?.code,
					user_id,
				},
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2003') throw new Error('CATEGORY_NOT_FOUND');
			if (error.message === 'PATRIMONY_NOT_FOUND') throw error;
			if (error.message === 'DUPLICATED_TICKET') throw error;
			throw new Error(`Error creating ticket: ${error}`);
		}
	}

	static async findAll(
		{ user_id, role },
		{
			category_id,
			patrimony_code,
			status,
			technician_id,
			created_after,
			created_before,
		},
	) {
		let where = {};
		if (role === 'technician') {
			where.OR = [
				{ technician_id: user_id },
				{
					Category: {
						Technician_Category: {
							some: { technician_id: user_id },
						},
					},
				},
			];
		}
		if (role === 'user') where.user_id = user_id;

		let patrimony = null;
		if (patrimony_code) {
			patrimony = await prisma.patrimony.findUnique({
				where: { code: patrimony_code },
			});

			if (!patrimony) throw new Error('NOT_FOUND');

			where.patrimony_code = patrimony.code;
		}

		const filters = {
			...(category_id && { category_id: category_id }),
			...(status && { status: status }),
			...(technician_id && { technician_id: technician_id }),
		};

		if (created_before || created_after) {
			filters.created_at = {
				...(created_before && { lte: new Date(created_before) }),
				...(created_after && { gte: new Date(created_after) }),
			};
		}

		where = { ...where, ...filters };

		return await prisma.ticket.findMany({
			where,
			select: this._baseSelect,
		});
	}

	static async findById({ ticket_id, user_id, role }) {
		const ticket = await prisma.ticket.findUnique({
			where: { id: ticket_id },
			select: this._baseSelect,
		});

		if (!ticket) throw new Error('NOT_FOUND');

		if (
			role !== 'admin' &&
			ticket.user_id !== user_id &&
			ticket.technician_id !== user_id
		)
			throw new Error('FORBIDDEN');

		return ticket;
	}

	static async update({ ticket_id, data, role }) {
		if (role !== 'admin' && data.patrimony_code) {
			throw new Error('FORBIDDEN');
		}

		try {
			const current = await prisma.ticket.findUnique({
				where: { id: ticket_id },
				select: {
					category_id: true,
					technician_id: true,
					status: true,
				},
			});

			if (!current) throw new Error('NOT_FOUND');

			let updateData = { ...data };

			if (data.category_id && data.category_id !== current.category_id) {
				updateData.technician_id = null;
				updateData.status = 'pending';
			}

			if (
				data.technician_id &&
				!current.technician_id &&
				current.status === 'pending'
			) {
				updateData.status = 'in_progress';
			}

			return await prisma.ticket.update({
				where: { id: ticket_id },
				data: updateData,
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');
			throw new Error(`Error updating ticket: ${error}`);
		}
	}

	static async delete({ ticket_id }) {
		try {
			await prisma.ticket.delete({
				where: { id: ticket_id },
			});
			return;
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');
			throw new Error(`Error deleting ticket: ${error}`);
		}
	}

	async updateStatus({ status, user_id, role }) {
		const ticket = await prisma.ticket.findUnique({
			where: { id: this.id },
			select: this._baseSelect,
		});

		if (!ticket) throw new Error('NOT_FOUND');

		if (ticket.status === 'completed') throw new Error('FORBIDDEN');

		// Regra de negócio/ownership: admin ou técnico responsável
		if (
			role !== 'admin' &&
			(role !== 'technician' || ticket.technician_id !== user_id)
		)
			throw new Error('FORBIDDEN');

		// Fluxo de estado permitido
		if (status === 'in_progress' && ticket.status !== 'pending')
			throw new Error('FORBIDDEN');

		if (status === 'completed' && ticket.status !== 'in_progress')
			throw new Error('FORBIDDEN');

		let data_to_update = {};
		if (status === 'in_progress')
			data_to_update = { started_at: new Date() };
		if (status === 'completed') {
			const start = new Date(ticket.started_at);
			const end = new Date();
			data_to_update = {
				closed_at: end,
				duration_seconds: (end.getTime() - start.getTime()) / 1000,
			};
		}

		return await prisma.ticket.update({
			where: { id: this.id },
			data: {
				status,
				...data_to_update,
			},
			select: this._baseSelect,
		});
	}

	async assignTechnician({ technician_id, role, user_id }) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { id: this.id },
				select: {
					id: true,
					status: true,
					technician_id: true,
					category_id: true,
				},
			});

			if (!ticket) throw new Error('TICKET_NOT_FOUND');

			const technician = await prisma.user.findUnique({
				where: { id: technician_id },
				select: {
					id: true,
					role: true,
					Technician_Category: { select: { category_id: true } },
				},
			});

			if (!technician || technician.role !== 'technician') {
				throw new Error('TECHNICIAN_NOT_FOUND');
			}

			const can_handle_category = technician.Technician_Category.some(
				(c) => c.category_id === ticket.category_id,
			);
			if (!can_handle_category) {
				throw new Error('FORBIDDEN_CATEGORY');
			}

			let data_to_update = { technician_id: technician_id };
			if (
				role === 'technician' &&
				technician_id === user_id &&
				ticket.status === 'pending'
			) {
				data_to_update = {
					...data_to_update,
					status: 'in_progress',
					started_at: new Date(),
				};
			}

			return await prisma.ticket.update({
				where: { id: this.id },
				data: data_to_update,
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.message === 'TICKET_NOT_FOUND')
				throw new Error('TICKET_NOT_FOUND');
			if (error.message === 'TECHNICIAN_NOT_FOUND') throw error;
			if (error.message === 'FORBIDDEN_CATEGORY') throw error;
			throw new Error(`Error assigning technician: ${error}`);
		}
	}

	static _baseSelect = {
		id: true,
		title: true,
		description: true,
		status: true,
		started_at: true,
		closed_at: true,
		duration_seconds: true,
		created_at: true,
		updated_at: true,
		technician_id: true,
		user_id: true,
		User: {
			select: {
				id: true,
				name: true,
				email: true,
			},
		},
		Technician: {
			select: {
				id: true,
				name: true,
				email: true,
			},
		},
		Category: {
			select: {
				id: true,
				title: true,
			},
		},
		Patrimony: {
			select: {
				id: true,
				code: true,
				name: true,
				description: true,
			},
		},
	};
}
