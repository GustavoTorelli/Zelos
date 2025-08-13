import prisma from '../config/prisma-client.js';

export class Ticket {
	constructor({ id }) {
		this.id = id;
	}

	/**
	 * Creates a new ticket
	 * @param {{ title: string, description: string, category_id: number, patrimony_id?: number, user_id: number }} data - The data of the ticket to be created
	 * @returns {Promise<Object>} A promise that resolves to the newly created ticket object
	 * @throws {Error} If a ticket with the same patrimony already exists and is not completed
	 * @throws {Error} If there is an error creating the ticket
	 */
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

	/**
	 * Finds all tickets that match the given criteria
	 * @param {Object} data - The data to filter the tickets by
	 * @param {number} data.userId - The ID of the user
	 * @param {string} data.role - The role of the user
	 * @param {number} data.categoryId - The ID of the category to filter by
	 * @param {number} data.patrimonyId - The ID of the patrimony to filter by
	 * @param {string} data.status - The status of the ticket to filter by
	 * @param {number} data.technicianId - The ID of the technician to filter by
	 * @param {Date} data.createdAfter - The date to filter tickets created after
	 * @param {Date} data.createdBefore - The date to filter tickets created before
	 * @returns {Promise<Object[]>} A promise that resolves to an array of tickets
	 */
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

	/**
	 * Finds a ticket by its ID
	 * @param {{ ticketId: number, userId: number, role: string }} data - The data to find the ticket by
	 * @returns {Promise<Object>} A promise that resolves to the ticket object
	 * @throws {Error} If the ticket is not found or the user does not have permission to view the ticket
	 */
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

	/**
	 * Updates a ticket by ID
	 * @param {{ ticketId: number, data: Object, role: string }} data - The data to update the ticket with
	 * @returns {Promise<Object>} A promise that resolves to the updated ticket object
	 * @throws {Error} If the ticket is not found or the user does not have permission to update the ticket
	 */
	static async update({ ticketId, data, role }) {
		if (role !== 'admin' && !data.patrimony_id)
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

	/**
	 * Updates the status of a ticket
	 * @param {{ status: string, userId: number, role: string }} data - The data to update the ticket with
	 * @returns {Promise<Object>} A promise that resolves to the updated ticket object
	 * @throws {Error} If the ticket is not found or the user does not have permission to update the ticket
	 */
	async updateStatus({ status, userId, role }) {
		const ticket = await prisma.ticket.findUnique({
			where: { id: this.id },
			select: this._baseSelect,
		});

		if (!ticket) throw new Error('NOT_FOUND');

		// Only admin and technician can change status
		if (
			role !== 'admin' &&
			(role !== 'technician' || ticket.user_id !== userId)
		)
			throw new Error('FORBIDDEN');

		// Status can only be changed from pending to in_progress
		if (status === 'in_progress' && ticket.status !== 'pending')
			throw new Error('FORBIDDEN');

		// Status can only be changed from in_progress to completed
		if (status === 'completed' && ticket.status !== 'in_progress')
			throw new Error('FORBIDDEN');

		return await prisma.ticket.update({
			where: { id: this.id },
			data: { status },
			select: this._baseSelect,
		});
	}

	/**
	 * Assigns a technician to a ticket
	 * @param {{ ticketId: number, technicianId: number, role: string }} data - The data to assign the technician to the ticket with
	 * @returns {Promise<Object>} A promise that resolves to the updated ticket object
	 * @throws {Error} If the user does not have permission to assign a technician to the ticket
	 */
	async assignTechnician({ technicianId, role }) {
		if (role !== 'admin' && role !== 'technician')
			throw new Error('FORBIDDEN');

		return await prisma.ticket.update({
			where: { id: this.id },
			data: { technician_id: technicianId },
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
