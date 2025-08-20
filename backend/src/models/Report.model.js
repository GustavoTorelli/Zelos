import prisma from '../config/prisma-client.js';

export class Report {
	// Build filters
	static _buildWhere({
		startDate,
		endDate,
		status,
		categoryId,
		technicianId,
	}) {
		const yearStart = new Date(new Date().getFullYear(), 0, 1);
		return {
			...(status && { status }),
			...(categoryId && { category_id: categoryId }),
			...(technicianId && { technician_id: technicianId }),
			created_at: {
				gte: startDate ? new Date(startDate) : yearStart,
				lte: endDate ? new Date(endDate) : new Date(),
			},
		};
	}

	// Base select com todos os relacionamentos
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
			patrimony_id: true,
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

	// Count tickets by status com dados relacionados
	static async ticketsByStatus(filters) {
		const where = this._buildWhere(filters);

		// Busca os tickets agrupados por status
		const groupedData = await prisma.ticket.groupBy({
			by: ['status'],
			_count: { id: true },
			where,
		});

		// Para cada status, busca alguns tickets de exemplo com dados completos
		const enrichedData = await Promise.all(
			groupedData.map(async (item) => {
				const sampleTickets = await prisma.ticket.findMany({
					where: {
						...where,
						status: item.status,
					},
					select: this._getBaseSelect(),
					take: 3, // Pega 3 exemplos de tickets
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

	// Count tickets by category com dados relacionados
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

	// Activity per technician com dados relacionados
	static async technicianActivity(filters) {
		const where = this._buildWhere(filters);

		const groupedData = await prisma.ticket.groupBy({
			by: ['technician_id'],
			_count: { id: true },
			_avg: { duration_seconds: true },
			where: {
				...where,
				technician_id: { not: null }, // Remove tickets sem técnico
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

	// Lista completa de tickets com todos os relacionamentos
	static async listTickets(filters) {
		const where = this._buildWhere(filters);

		return await prisma.ticket.findMany({
			where,
			select: this._getBaseSelect(),
			orderBy: { created_at: 'desc' },
		});
	}

	// Método auxiliar para formatar duração
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
