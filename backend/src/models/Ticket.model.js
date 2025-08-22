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
		{ userId, role },
		{
			categoryId,
			patrimonyCode,
			status,
			technicianId,
			createdAfter,
			createdBefore,
		},
	) {
		let where = {};
		if (role === 'technician') {
			where.OR = [
				{ technician_id: userId },
				{
					Category: {
						Technician_Category: {
							some: { technician_id: userId },
						},
					},
				},
			];
		}
		if (role === 'user') where.user_id = userId;

		let patrimony = null;
		if (patrimonyCode) {
			patrimony = await prisma.patrimony.findUnique({
				where: { code: patrimonyCode },
			});

			if (!patrimony) throw new Error('NOT_FOUND');

			where.patrimony_code = patrimony.code;
		}

		const filters = {
			...(categoryId && { category_id: categoryId }),
			...(status && { status: status }),
			...(technicianId && { technician_id: technicianId }),
		};

		if (createdBefore || createdAfter) {
			filters.created_at = {
				...(createdBefore && { lte: new Date(createdBefore) }),
				...(createdAfter && { gte: new Date(createdAfter) }),
			};
		}

		where = { ...where, ...filters };

		return await prisma.ticket.findMany({
			where,
			select: this._baseSelect,
		});
	}

	static async findById({ ticketId, userId, role }) {
		const ticket = await prisma.ticket.findUnique({
			where: { id: ticketId },
			select: this._baseSelect,
		});

		if (!ticket) throw new Error('NOT_FOUND');

		if (
			role !== 'admin' &&
			ticket.user_id !== userId &&
			ticket.technician_id !== userId
		)
			throw new Error('FORBIDDEN');

		return ticket;
	}

	static async update({ ticketId, data, role }) {
		if (role !== 'admin' && data.patrimony_code)
			throw new Error('FORBIDDEN');

		try {
			return await prisma.ticket.update({
				where: { id: ticketId },
				data,
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.code === 'P2025') throw new Error('NOT_FOUND');
			throw new Error(`Error updating ticket: ${error}`);
		}
	}

	async updateStatus({ status, userId, role }) {
		const ticket = await prisma.ticket.findUnique({
			where: { id: this.id },
			select: this._baseSelect,
		});

		if (!ticket) throw new Error('NOT_FOUND');

		if (ticket.status === 'completed') throw new Error('FORBIDDEN');

		// Only admin and technician can change status
		if (
			role !== 'admin' &&
			(role !== 'technician' || ticket.technician_id !== userId)
		)
			throw new Error('FORBIDDEN');

		// Status can only be changed from pending to in_progress
		if (status === 'in_progress' && ticket.status !== 'pending')
			throw new Error('FORBIDDEN');

		// Status can only be changed from in_progress to completed
		if (status === 'completed' && ticket.status !== 'in_progress')
			throw new Error('FORBIDDEN');

		let dataToUpdate = {};
		if (status === 'in_progress') dataToUpdate = { started_at: new Date() };
		if (status === 'completed') {
			const start = new Date(ticket.started_at);
			const end = new Date();
			dataToUpdate = {
				closed_at: end,
				duration_seconds: (end.getTime() - start.getTime()) / 1000,
			};
		}

		return await prisma.ticket.update({
			where: { id: this.id },
			data: {
				status,
				...dataToUpdate,
			},
			select: this._baseSelect,
		});
	}

	async assignTechnician({ technicianId, role, userId }) {
		if (role !== 'admin' && role !== 'technician')
			throw new Error('FORBIDDEN');

		try {
			// find ticket
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

			// find technician and categories
			const technician = await prisma.user.findUnique({
				where: { id: technicianId },
				select: {
					id: true,
					role: true,
					Technician_Category: { select: { category_id: true } },
				},
			});

			if (!technician || technician.role !== 'technician') {
				throw new Error('TECHNICIAN_NOT_FOUND');
			}

			// Check if technician can handle category
			const canHandleCategory = technician.Technician_Category.some(
				(c) => c.category_id === ticket.category_id,
			);
			if (!canHandleCategory) {
				throw new Error('FORBIDDEN_CATEGORY');
			}

			// if technician is assigned to ticket, change status
			let dataToUpdate = { technician_id: technicianId };
			if (
				role === 'technician' &&
				technicianId === userId &&
				ticket.status === 'pending'
			) {
				dataToUpdate = {
					...dataToUpdate,
					status: 'in_progress',
					started_at: new Date(),
				};
			}

			return await prisma.ticket.update({
				where: { id: this.id },
				data: dataToUpdate,
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
				description: true,
			},
		},
	};
}
