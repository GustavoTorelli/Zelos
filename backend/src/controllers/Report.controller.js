import { Report } from '../models/Report.model.js';
import { streamCsv, streamPdf } from '../utils/report-generator.js';
import apiResponse from '../utils/api-response.js';
import { ZodError } from 'zod';
import { reportSchema } from '../schemas/report.schema.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     ReportStatusData:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "pending"
 *         count:
 *           type: integer
 *           example: 15
 *         exemplos:
 *           type: integer
 *           example: 3
 *
 *     ReportTypeData:
 *       type: object
 *       properties:
 *         categoria:
 *           type: string
 *           example: "hardware"
 *         categoria_id:
 *           type: integer
 *           example: 1
 *         count:
 *           type: integer
 *           example: 25
 *
 *     ReportTechnicianData:
 *       type: object
 *       properties:
 *         tecnico:
 *           type: string
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao.silva@empresa.com"
 *         total_tickets:
 *           type: integer
 *           example: 42
 *         duracao_media:
 *           type: string
 *           example: "2h 30m 45s"
 *
 *     ReportListData:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 123
 *         titulo:
 *           type: string
 *           example: "Problema no computador da sala 201"
 *         status:
 *           type: string
 *           example: "in_progress"
 *         categoria:
 *           type: string
 *           example: "hardware"
 *         tecnico_responsavel:
 *           type: string
 *           example: "João Silva"
 *         tecnico_email:
 *           type: string
 *           format: email
 *           example: "joao.silva@empresa.com"
 *         usuario_criador:
 *           type: string
 *           example: "Maria Santos"
 *         usuario_email:
 *           type: string
 *           format: email
 *           example: "maria.santos@empresa.com"
 *         patrimonio:
 *           type: string
 *           example: "PC-001-2024"
 *         data_criacao:
 *           type: string
 *           format: date-time
 *           example: "2025-08-31T14:30:00.000Z"
 *         data_atualizacao:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T09:15:00.000Z"
 *         data_inicio:
 *           type: string
 *           format: date-time
 *           example: "2025-08-31T15:00:00.000Z"
 *         data_fechamento:
 *           type: string
 *           example: "Em aberto"
 *         duracao_formatada:
 *           type: string
 *           example: "18h 45m 30s"
 *
 *   responses:
 *     ReportGenerated:
 *       description: Relatório gerado com sucesso (formato JSON)
 *       content:
 *         application/json:
 *           examples:
 *             statusReport:
 *               summary: Relatório por Status
 *               value:
 *                 success: true
 *                 data:
 *                   - status: "pending"
 *                     count: 15
 *                     exemplos: 3
 *                   - status: "in_progress"
 *                     count: 8
 *                     exemplos: 3
 *                   - status: "completed"
 *                     count: 32
 *                     exemplos: 3
 *             typeReport:
 *               summary: Relatório por Categoria
 *               value:
 *                 success: true
 *                 data:
 *                   - categoria: "hardware"
 *                     categoria_id: 1
 *                     count: 25
 *                   - categoria: "software"
 *                     categoria_id: 2
 *                     count: 18
 *             technicianReport:
 *               summary: Relatório de Atividade dos Técnicos
 *               value:
 *                 success: true
 *                 data:
 *                   - tecnico: "João Silva"
 *                     email: "joao.silva@empresa.com"
 *                     total_tickets: 42
 *                     duracao_media: "2h 30m 45s"
 *                   - tecnico: "Maria Santos"
 *                     email: "maria.santos@empresa.com"
 *                     total_tickets: 35
 *                     duracao_media: "1h 45m 20s"
 *             listReport:
 *               summary: Lista Completa de Tickets
 *               value:
 *                 success: true
 *                 data:
 *                   - id: 123
 *                     titulo: "Problema no computador da sala 201"
 *                     status: "in_progress"
 *                     categoria: "hardware"
 *                     tecnico_responsavel: "João Silva"
 *                     tecnico_email: "joao.silva@empresa.com"
 *                     usuario_criador: "Maria Santos"
 *                     usuario_email: "maria.santos@empresa.com"
 *                     patrimonio: "PC-001-2024"
 *                     data_criacao: "2025-08-31T14:30:00.000Z"
 *                     data_atualizacao: "2025-09-01T09:15:00.000Z"
 *                     data_inicio: "2025-08-31T15:00:00.000Z"
 *                     data_fechamento: "Em aberto"
 *                     duracao_formatada: "18h 45m 30s"
 *
 *     ReportCsvGenerated:
 *       description: Relatório gerado em formato CSV
 *       content:
 *         text/csv:
 *           schema:
 *             type: string
 *             format: binary
 *           example: |
 *             "status";"total_no_status";"ticket_id";"ticket_titulo"
 *             "pending";15;123;"Problema no computador"
 *             "pending";15;124;"Impressora não funciona"
 *
 *     ReportPdfGenerated:
 *       description: Relatório gerado em formato PDF
 *       content:
 *         application/pdf:
 *           schema:
 *             type: string
 *             format: binary
 *
 *     InvalidReportType:
 *       description: Tipo de relatório inválido
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Invalid report type"
 *             code: 400
 *             data: null
 *
 *     InvalidRequestReport:
 *       description: Erro de validação dos parâmetros do relatório
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Invalid request data"
 *             code: 400
 *             data: null
 *             errors:
 *               - path: ["type"]
 *                 message: "Type is required"
 *                 expected: undefined
 *               - path: ["start_date"]
 *                 message: "Invalid date format"
 *                 expected: undefined
 *
 *     UnexpectedErrorReport:
 *       description: Erro inesperado na geração do relatório
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Unexpected error"
 *             code: 500
 *             data: null
 *             errors: "Database connection timeout"
 */

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
