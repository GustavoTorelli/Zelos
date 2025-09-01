import { Router } from 'express';
import { ReportController } from '../controllers/Report.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const reportController = new ReportController();

/**
 * @openapi
 * /reports:
 *   get:
 *     summary: Gera relatórios em diferentes formatos
 *     description: |
 *       Gera relatórios de tickets com base nos filtros especificados.
 *       Suporta múltiplos tipos de relatório e formatos de saída (JSON, CSV, PDF).
 *
 *       **Tipos de relatório disponíveis:**
 *       - `status`: Distribuição de tickets por status
 *       - `type`: Distribuição de tickets por categoria
 *       - `technician`: Atividade e performance dos técnicos
 *       - `list`: Lista completa de tickets com todos os detalhes
 *
 *       **Formatos de saída:**
 *       - `json`: Retorna dados estruturados em JSON (padrão)
 *       - `csv`: Gera arquivo CSV para download
 *       - `pdf`: Gera arquivo PDF com gráficos e visualizações
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [status, type, technician, list]
 *         description: Tipo de relatório a ser gerado
 *         example: status
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [json, csv, pdf]
 *           default: json
 *         description: Formato de saída do relatório
 *         example: json
 *       - in: query
 *         name: start_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data inicial para filtrar os dados (ISO 8601)
 *         example: "2025-01-01"
 *       - in: query
 *         name: end_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data final para filtrar os dados (ISO 8601)
 *         example: "2025-12-31"
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         description: Filtrar por status específico
 *         example: pending
 *       - in: query
 *         name: category_id
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID da categoria para filtrar
 *         example: 1
 *       - in: query
 *         name: technician_id
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do técnico para filtrar
 *         example: 5
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ReportGenerated'
 *       400:
 *         oneOf:
 *           - $ref: '#/components/responses/InvalidRequestReport'
 *           - $ref: '#/components/responses/InvalidReportType'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/UnexpectedErrorReport'
 *     examples:
 *       statusReportJson:
 *         summary: Relatório por Status (JSON)
 *         value:
 *           type: status
 *           format: json
 *           start_date: "2025-01-01T00:00:00.000Z"
 *           end_date: "2025-12-31T23:59:59.999Z"
 *       categoryReportCsv:
 *         summary: Relatório por Categoria (CSV)
 *         value:
 *           type: type
 *           format: csv
 *           category_id: 1
 *       technicianReportPdf:
 *         summary: Relatório de Técnicos (PDF)
 *         value:
 *           type: technician
 *           format: pdf
 *           technician_id: 5
 *           start_date: "2025-08-01T00:00:00.000Z"
 *       ticketListReport:
 *         summary: Lista Completa de Tickets
 *         value:
 *           type: list
 *           format: json
 *           status: in_progress
 */
router.get('/', auth('admin'), async (req, res) => {
	return await reportController.generate(req, res);
});

export default router;
