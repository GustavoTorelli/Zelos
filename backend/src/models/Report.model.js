import prisma from '../config/prisma-client.js';

export class Report {
	static _buildWhere({
		start_date,
		end_date,
		status,
		category_id,
		technician_id,
	}) {
		const yearStart = new Date(new Date().getFullYear(), 0, 1);
		return {
			...(status && { status }),
			...(category_id && { category_id }),
			...(technician_id && { technician_id }),
			created_at: {
				gte: start_date ? new Date(start_date) : yearStart,
				lte: end_date ? new Date(end_date) : new Date(),
			},
		};
	}

	static _getBaseSelect() {
		return {
			id: true,
			title: true,
			description: true,
			status: true,
			created_at: true,
			updated_at: true,
			started_at: true,
			closed_at: true,
			duration_seconds: true,
			category_id: true,
			technician_id: true,
			user_id: true,
			patrimony_code: true,
			Category: {
				select: {
					id: true,
					title: true,
					description: true,
				},
			},
			Technician: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
			User: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
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

	static async ticketsByStatus(filters) {
		const where = this._buildWhere(filters);

		const groupedData = await prisma.ticket.groupBy({
			by: ['status'],
			_count: { id: true },
			where,
		});

		const enrichedData = await Promise.all(
			groupedData.map(async (item) => {
				const sampleTickets = await prisma.ticket.findMany({
					where: {
						...where,
						status: item.status,
					},
					select: this._getBaseSelect(),
					take: 3,
					orderBy: { created_at: 'desc' },
				});

				return {
					status: item.status,
					count: item._count.id,
					sampleTickets,
				};
			}),
		);

		return enrichedData;
	}

	static async ticketsByType(filters) {
		const where = this._buildWhere(filters);

		const groupedData = await prisma.ticket.groupBy({
			by: ['category_id'],
			_count: { id: true },
			where,
		});

		const enrichedData = await Promise.all(
			groupedData.map(async (item) => {
				const category = await prisma.category.findUnique({
					where: { id: item.category_id },
				});

				const sampleTickets = await prisma.ticket.findMany({
					where: {
						...where,
						category_id: item.category_id,
					},
					select: this._getBaseSelect(),
					take: 3,
					orderBy: { created_at: 'desc' },
				});

				return {
					category_id: item.category_id,
					category_name: category?.title || 'N/A',
					category_description: category?.description || 'N/A',
					count: item._count.id,
					sampleTickets,
				};
			}),
		);

		return enrichedData;
	}

	static async technicianActivity(filters) {
		const where = this._buildWhere(filters);

		const groupedData = await prisma.ticket.groupBy({
			by: ['technician_id'],
			_count: { id: true },
			_avg: { duration_seconds: true },
			where: {
				...where,
				technician_id: { not: null },
			},
		});

		const enrichedData = await Promise.all(
			groupedData.map(async (item) => {
				const technician = await prisma.user.findUnique({
					where: { id: item.technician_id },
				});

				const recentTickets = await prisma.ticket.findMany({
					where: {
						...where,
						technician_id: item.technician_id,
					},
					select: this._getBaseSelect(),
					take: 5,
					orderBy: { updated_at: 'desc' },
				});

				return {
					technician_id: item.technician_id,
					technician_name: technician?.name || 'N/A',
					technician_email: technician?.email || 'N/A',
					ticket_count: item._count.id,
					avg_duration_seconds: item._avg.duration_seconds || 0,
					avg_duration_formatted: item._avg.duration_seconds
						? this._formatDuration(item._avg.duration_seconds)
						: 'N/A',
					recentTickets,
				};
			}),
		);

		return enrichedData;
	}

	static async listTickets(filters) {
		const where = this._buildWhere(filters);

		return await prisma.ticket.findMany({
			where,
			select: this._getBaseSelect(),
			orderBy: { created_at: 'desc' },
		});
	}

	static _formatDuration(seconds) {
		if (!seconds) return 'N/A';

		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		if (hours > 0) {
			return `${hours}h ${minutes}m ${remainingSeconds}s`;
		} else if (minutes > 0) {
			return `${minutes}m ${remainingSeconds}s`;
		} else {
			return `${remainingSeconds}s`;
		}
	}
}
