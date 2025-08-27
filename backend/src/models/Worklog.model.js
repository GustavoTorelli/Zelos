import prisma from '../config/prisma-client.js';

export class Worklog {
	constructor({ id }) {
		this.id = id;
	}

	static async create({ ticket_id, description, technician_id, role }) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { id: ticket_id },
				select: { id: true, technician_id: true, status: true },
			});

			if (!ticket) throw new Error('NOT_FOUND');

			if (ticket.status !== 'in_progress')
				throw new Error('FORBIDDEN_STATUS');

			if (
				role === 'technician' &&
				ticket.technician_id !== technician_id
			) {
				throw new Error('FORBIDDEN');
			}

			return await prisma.worklog.create({
				data: {
					description,
					ticket_id: ticket_id,
					technician_id: technician_id,
				},
				select: this._baseSelect,
			});
		} catch (error) {
			if (
				['NOT_FOUND', 'FORBIDDEN_STATUS', 'FORBIDDEN'].includes(
					error.message,
				)
			) {
				throw error;
			}
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

	static async findById({ worklogId, ticketId, userId, role }) {
		const wl = await prisma.worklog.findUnique({
			where: { id: worklogId },
			select: this._baseSelect,
		});

		if (!wl) throw new Error('NOT_FOUND');

		if (ticketId && wl.ticket_id !== Number(ticketId)) {
			throw new Error('INVALID_TICKET');
		}

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
