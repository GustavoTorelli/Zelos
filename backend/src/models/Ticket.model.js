import { th } from 'zod/locales';
import prisma from '../config/prisma-client.js';

export class Ticket {
	constructor({ id }) {
		this.id = id;
	}

	static async create({
		title,
		description,
		category_id,
		patrimony_id,
		user_id,
	}) {
		try {
			if (patrimony_id) {
				const existing = await prisma.ticket.findFirst({
					where: {
						patrimony_id,
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
					patrimony_id,
					user_id,
				},
				select: this._baseSelect,
			});
		} catch (error) {
			if (error.message === 'DUPLICATED_TICKET') throw error;
			throw new Error(`Error creating ticket: ${error}`);
		}
	}

	static async findAll(
		{ userId, role },
		{
			categoryId,
			patrimonyId,
			status,
			technicianId,
			createdAfter,
			createdBefore,
		},
	) {
		let where = {};
		if (role === 'technician') where.technician_id = userId;
		if (role === 'user') where.user_id = userId;

		const filters = {
			...(categoryId && { category_id: categoryId }),
			...(patrimonyId && { patrimony_id: patrimonyId }),
			...(status && { status: status }),
			...(technicianId && { technician_id: technicianId }),
		};

		if (createdBefore || createdAfter) {
			filters.created_at = {};
			if (createdAfter) filters.created_at.gte = new Date(createdAfter);
			if (createdBefore) filters.created_at.lte = new Date(createdBefore);
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
		if (role !== 'admin') throw new Error('FORBIDDEN');

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

		if (role !== 'admin' && ticket.technician_id !== userId) {
			throw new Error('FORBIDDEN');
		}

		return await prisma.ticket.update({
			where: { id: this.id },
			data: { status },
			select: this._baseSelect,
		});
	}

	static _baseSelect = {
		id: true,
		title: true,
		description: true,
		status: true,
		closed_at: true,
		created_at: true,
		updated_at: true,
		user_id: true,
		technician_id: true,
		category_id: true,
		patrimony_id: true,
	};
}
