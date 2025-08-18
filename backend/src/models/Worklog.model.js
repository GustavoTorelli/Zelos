import prisma from '../config/prisma-client.js';

export class Worklog {
	constructor({ id }) {
		this.id = id;
	}

	static async create({ ticketId, description, technicianId, role }) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { id: ticketId },
				select: { id: true, technician_id: true, status: true },
			});

			if (!ticket) throw new Error('NOT_FOUND');

			if (ticket.status !== 'in_progress')
				throw new Error('FORBIDDEN_STATUS');

			if (
				role === 'technician' &&
				ticket.technician_id !== technicianId
			) {
				throw new Error('FORBIDDEN');
			}

			return await prisma.worklog.create({
				data: {
					description,
					ticket_id: ticketId,
					technician_id: technicianId,
				},
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.message === 'NOT_FOUND') throw error;
			if (error.message === 'FORBIDDEN_STATUS') throw error;
			if (error.message === 'FORBIDDEN') throw error;
			throw new Error(`Error creating worklog: ${error}`);
		}
	}

	static async findAll({ ticketId, technicianId }) {
		const where = {
			...(ticketId && { ticket_id: ticketId }),
			...(technicianId && { technician_id: technicianId }),
		};

		return await prisma.worklog.findMany({
			where,
			orderBy: { created_at: 'desc' },
			select: this._baseSelect,
		});
	}

	static async findById({ worklogId, userId, role }) {
		const wl = await prisma.worklog.findUnique({
			where: { id: worklogId },
			select: this._baseSelect,
		});

		if (!wl) throw new Error('NOT_FOUND');

		if (role !== 'admin' && wl.technician_id !== userId) {
			throw new Error('FORBIDDEN');
		}

		return wl;
	}

	static _baseSelect = {
		id: true,
		description: true,
		created_at: true,
		technician_id: true,
		ticket_id: true,
		Technician: {
			select: {
				id: true,
				name: true,
				email: true,
			},
		},
		Ticket: {
			select: {
				id: true,
				title: true,
				status: true,
				user_id: true,
				technician_id: true,
			},
		},
	};
}
