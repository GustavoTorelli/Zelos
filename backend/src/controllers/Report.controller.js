import { Report } from '../models/Report.model.js';
import { streamCsv, streamPdf } from '../utils/report-generator.js';
import apiResponse from '../utils/api-response.js';
import { ZodError } from 'zod';
import { reportSchema } from '../schemas/report.schema.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';

export class ReportController {
	async generate(req, res) {
		try {
			const params = reportSchema.parse(req.query);
			const { type, format = 'json', ...filters } = params;
			let rows, data, reportTitle, reportSubtitle;

			switch (type) {
				case 'status':
					data = await Report.ticketsByStatus(filters);
					reportTitle = 'Relatório por Status';
					reportSubtitle = 'Distribuição de tickets por status';

					if (format === 'csv') {
						rows = [];
						data.forEach((statusGroup) => {
							statusGroup.sampleTickets.forEach((ticket) => {
								rows.push({
									status: statusGroup.status,
									total_no_status: statusGroup.count,
									ticket_id: ticket.id,
									ticket_titulo: ticket.title,
									categoria: ticket.Category?.title || 'N/A',
									tecnico_responsavel:
										ticket.Technician?.name || 'N/A',
									usuario_criador: ticket.User?.name || 'N/A',
									usuario_email: ticket.User?.email || 'N/A',
									data_criacao: ticket.created_at,
									data_atualizacao: ticket.updated_at,
									duracao_formatada: ticket.duration_seconds
										? Report._formatDuration(
												ticket.duration_seconds,
											)
										: 'N/A',
								});
							});
						});
					} else {
						rows = data.map((d) => ({
							status: d.status,
							count: d.count,
							exemplos: d.sampleTickets.length,
						}));
					}
					break;

				case 'type':
					data = await Report.ticketsByType(filters);
					reportTitle = 'Relatório por Categoria';
					reportSubtitle = 'Distribuição de tickets por categoria';

					if (format === 'csv') {
						rows = [];
						data.forEach((categoryGroup) => {
							categoryGroup.sampleTickets.forEach((ticket) => {
								rows.push({
									categoria_id: categoryGroup.category_id,
									categoria_nome: categoryGroup.category_name,
									total_na_categoria: categoryGroup.count,
									ticket_id: ticket.id,
									ticket_titulo: ticket.title,
									status: ticket.status,
									tecnico_responsavel:
										ticket.Technician?.name || 'N/A',
									usuario_criador: ticket.User?.name || 'N/A',
									usuario_email: ticket.User?.email || 'N/A',
									data_criacao: ticket.created_at,
									duracao_formatada: ticket.duration_seconds
										? Report._formatDuration(
												ticket.duration_seconds,
											)
										: 'N/A',
								});
							});
						});
					} else {
						rows = data.map((d) => ({
							categoria: d.category_name,
							categoria_id: d.category_id,
							count: d.count,
						}));
					}
					break;

				case 'technician':
					data = await Report.technicianActivity(filters);
					reportTitle = 'Relatório de Atividade dos Técnicos';
					reportSubtitle = 'Performance e atividade por técnico';

					if (format === 'csv') {
						rows = [];
						data.forEach((techGroup) => {
							techGroup.recentTickets.forEach((ticket) => {
								rows.push({
									tecnico_id: techGroup.technician_id,
									tecnico_nome: techGroup.technician_name,
									tecnico_email: techGroup.technician_email,
									total_tickets: techGroup.ticket_count,
									duracao_media:
										techGroup.avg_duration_formatted,
									ticket_id: ticket.id,
									ticket_titulo: ticket.title,
									status: ticket.status,
									categoria: ticket.Category?.title || 'N/A',
									usuario_criador: ticket.User?.name || 'N/A',
									data_criacao: ticket.created_at,
									data_fechamento:
										ticket.closed_at || 'Em aberto',
									duracao_ticket: ticket.duration_seconds
										? Report._formatDuration(
												ticket.duration_seconds,
											)
										: 'N/A',
								});
							});
						});
					} else {
						rows = data.map((d) => ({
							tecnico: d.technician_name,
							email: d.technician_email,
							total_tickets: d.ticket_count,
							duracao_media: d.avg_duration_formatted,
						}));
					}
					break;

				case 'list':
					data = await Report.listTickets(filters);
					reportTitle = 'Lista Completa de Tickets';
					reportSubtitle = 'Todos os tickets com detalhes completos';

					rows = data.map((ticket) => ({
						id: ticket.id,
						titulo: ticket.title,
						status: ticket.status,
						categoria: ticket.Category?.title || 'N/A',
						tecnico_responsavel:
							ticket.Technician?.name || 'Não atribuído',
						tecnico_email: ticket.Technician?.email || 'N/A',
						usuario_criador: ticket.User?.name || 'N/A',
						usuario_email: ticket.User?.email || 'N/A',
						patrimonio: ticket.Patrimony?.code || 'N/A',
						data_criacao: ticket.created_at,
						data_atualizacao: ticket.updated_at,
						data_inicio: ticket.started_at || 'N/A',
						data_fechamento: ticket.closed_at || 'Em aberto',
						duracao_formatada: ticket.duration_seconds
							? Report._formatDuration(ticket.duration_seconds)
							: 'N/A',
					}));
					break;

				default:
					throw new Error('INVALID_TYPE');
			}

			switch (format) {
				case 'csv':
					return streamCsv(res, rows, `${type}_report.csv`);
				case 'pdf':
					return streamPdf(res, {
						title: reportTitle,
						subtitle: reportSubtitle,
						filters: filters,
						rows,
						type,
					});
			}

			return apiResponse({ success: true, data: rows, code: 200 }, res);
		} catch (err) {
			if (err instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(err),
						code: 400,
					},
					res,
				);
			}
			if (err.message === 'INVALID_TYPE') {
				return apiResponse(
					{
						success: false,
						message: 'Invalid report type',
						code: 400,
					},
					res,
				);
			}
			return apiResponse(
				{
					success: false,
					message: 'Unexpected error',
					errors: err.message,
					code: 500,
				},
				res,
			);
		}
	}
}
