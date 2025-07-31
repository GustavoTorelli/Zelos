import prisma from '../config/prisma-client';

export class Ticket {
	constructor({
		id,
		title,
		description,
		status,
		created_at,
		updated_at,
		category_id,
		technician_id = null,
		user_id,
		patrimony_id,
	}) {
		this.id = id;
		this.title = title;
		this.description = description;
		this.status = status;
		this.createdAt = created_at;
		this.updatedAt = updated_at;
		this.categoryId = category_id;
		this.technicianId = technician_id;
		this.userId = user_id;
		this.patrimonyId = patrimony_id;
	}

	/**
	 * Creates a new ticket
	 * @param {Object} data - The data of the ticket to be created
	 * @param {string} data.title - The title of the ticket
	 * @param {string} data.description - The description of the ticket
	 * @param {number} data.userId - The ID of the user who created the ticket
	 * @param {number} data.patrimonyId - The ID of the patrimony the ticket belongs to
	 * @param {number} data.categoryId - The ID of the category the ticket belongs to
	 * @returns {Promise<Ticket>} A promise that resolves to the newly created ticket
	 * @throws {Error} If there is an error creating the ticket
	 */
	static async create({
		title,
		description,
		userId,
		patrimonyId,
		categoryId,
	}) {
		try {
			const activePatrimonyTicket = await prisma.ticket.findFirst({
				where: {
					patrimonyId,
					category_id: categoryId,
					OR: [{ status: 'open' }, { status: 'in_progress' }],
				},
			});

			if (activePatrimonyTicket) {
				throw new Error(
					'Patrimony already has an active ticket for this category',
				);
			}

			return await prisma.ticket.create({
				data: {
					title,
					description,
					userId,
					patrimonyId,
					categoryId,
				},
			});
		} catch (error) {
			throw new Error(`Error creating ticket: ${error}`);
		}
	}

	/**
	 * Finds a ticket by its ID
	 * @param {number} id - The ID of the ticket
	 * @returns {Promise<Ticket | null>} A promise that resolves to the ticket if found, otherwise null
	 * @throws {Error} If there is an error finding the ticket
	 */
	static async find(id) {
		try {
			return await prisma.ticket.findUnique({
				where: {
					id,
				},
			});
		} catch (error) {
			throw new Error(`Error finding ticket: ${error}`);
		}
	}

	/**
	 * Finds all tickets
	 * @returns {Promise<Array<Ticket>>} A promise that resolves to an array of tickets
	 * @throws {Error} If there is an error finding the tickets
	 */
	static async findAll() {
		try {
			return await prisma.ticket.findMany({
				select: {
					id: true,
					title: true,
					description: true,
					status: true,
					created_at: true,
					updated_at: true,
					Category: {
						select: {
							id: true,
							title: true,
						},
					},
					Technician: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					User: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					Patrimony: {
						select: {
							id: true,
							code: true,
							description: true,
						},
					},
				},
			});
		} catch (error) {
			throw new Error(`Error finding tickets: ${error}`);
		}
	}

	/**
	 * Finds all tickets for a given user
	 * @param {number} userId - The ID of the user
	 * @returns {Promise<Array<Ticket>>} A promise that resolves to an array of tickets
	 * @throws {Error} If there is an error finding the tickets
	 */
	static async findAllByUserId(userId) {
		try {
			return await prisma.ticket.findMany({
				where: {
					userId,
				},
				select: {
					id: true,
					title: true,
					description: true,
					status: true,
					created_at: true,
					updated_at: true,
					Category: {
						select: {
							id: true,
							title: true,
						},
					},
					Technician: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					Patrimony: {
						select: {
							id: true,
							code: true,
							description: true,
						},
					},
				},
			});
		} catch (error) {
			throw new Error(
				`Error finding tickets for user ${userId}: ${error}`,
			);
		}
	}

	/**
	 * Find all tickets by category ID
	 * @param {number} categoryId - The ID of the category
	 * @returns {Promise<Array>} A promise that resolves to an array of tickets
	 * @throws {Error} If there is an error finding the tickets
	 */
	static async findAllByCategoryId(categoryId) {
		try {
			return await prisma.ticket.findMany({
				where: {
					categoryId,
				},
				select: {
					id: true,
					title: true,
					description: true,
					status: true,
					created_at: true,
					updated_at: true,
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
					Patrimony: {
						select: {
							id: true,
							code: true,
							description: true,
						},
					},
				},
			});
		} catch (error) {
			throw new Error(
				`Error finding tickets for category ${categoryId}: ${error}`,
			);
		}
	}

	/**
	 * Find all tickets by patrimony ID
	 * @param {number} patrimonyId - The ID of the patrimony
	 * @returns {Promise<Array>} A promise that resolves to an array of tickets
	 * @throws {Error} If there is an error finding the tickets
	 */
	static async findAllByPatrimonyId(patrimonyId) {
		try {
			return await prisma.ticket.findMany({
				where: {
					patrimonyId,
				},
				select: {
					id: true,
					title: true,
					description: true,
					status: true,
					created_at: true,
					updated_at: true,
					Category: {
						select: {
							id: true,
							title: true,
						},
					},
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
				},
			});
		} catch (error) {
			throw new Error(
				`Error finding tickets for patrimony ${patrimonyId}: ${error}`,
			);
		}
	}

	/**
	 * Set the status of the ticket to 'in_progress'
	 * @returns {Promise<Ticket>} The updated ticket
	 * @throws {Error} If the ticket is not found
	 * @throws {Error} If there is an error updating the ticket
	 */
	async setInProgress() {
		try {
			return await prisma.ticket.update({
				where: {
					id: this.id,
				},
				data: {
					status: 'in_progress',
				},
			});
		} catch (error) {
			if (error.code === 'P2025') {
				throw new Error(`Ticket ${this.id} not found`);
			}

			throw new Error('Error updating ticket: ', error);
		}
	}

	/**
	 * Set the status of the ticket to 'completed'
	 * @returns {Promise<Ticket>} The updated ticket
	 * @throws {Error} If the ticket is not found
	 * @throws {Error} If there is an error updating the ticket
	 */
	async setCompleted() {
		try {
			return await prisma.ticket.update({
				where: {
					id: this.id,
				},
				data: {
					status: 'completed',
				},
			});
		} catch (error) {
			if (error.code === 'P2025') {
				throw new Error(`Ticket ${this.id} not found`);
			}

			throw new Error('Error updating ticket: ', error);
		}
	}
}
