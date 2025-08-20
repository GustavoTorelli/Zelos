import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import dayjs from 'dayjs';

export function streamCsv(res, rows, filename = 'report.csv') {
	if (!rows.length) {
		rows = [{ message: 'Nenhum dado encontrado' }];
	}

	try {
		const fields = Object.keys(rows[0]);

		// Configuração melhorada do parser CSV para Excel brasileiro
		const parser = new Parser({
			fields,
			header: true,
			delimiter: ';', // Mudança para ponto e vírgula (padrão brasileiro)
			quote: '"',
			escapedQuote: '""',
			withBOM: true, // BOM para UTF-8
			eol: '\r\n', // Line ending Windows
		});

		const csv = parser.parse(rows);

		// Headers específicos para Excel brasileiro
		res.setHeader('Content-Type', 'text/csv; charset=utf-8');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${filename}"`,
		);
		res.setHeader('Cache-Control', 'no-cache');
		res.status(200).send('\uFEFF' + csv); // BOM explícito no início
	} catch (error) {
		console.error('Erro ao gerar CSV:', error);
		res.status(500).send('Erro ao gerar relatório CSV');
	}
}

export function streamPdf(res, { title, subtitle, filters, rows, type }) {
	try {
		// Create a new PDF document with better configuration
		const doc = new PDFDocument({
			size: 'A4',
			margin: 40,
			bufferPages: true,
		});

		// Set the response headers
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="relatorio_${type}_${Date.now()}.pdf"`,
		);

		// Pipe to response
		doc.pipe(res);

		// Header with styling
		doc.fontSize(20)
			.fillColor('#2c3e50')
			.font('Helvetica-Bold')
			.text(title, { align: 'center' });

		doc.moveDown(0.5);

		doc.fontSize(12)
			.fillColor('#7f8c8d')
			.font('Helvetica')
			.text(subtitle, { align: 'center' });

		doc.moveDown(0.3);

		// Filters information
		if (filters && Object.keys(filters).length > 0) {
			const filterText = Object.entries(filters)
				.filter(([key, value]) => value !== undefined && value !== null)
				.map(([key, value]) => {
					if (key.includes('Date')) {
						return `${key}: ${dayjs(value).format('DD/MM/YYYY')}`;
					}
					return `${key}: ${value}`;
				})
				.join(' | ');

			if (filterText) {
				doc.fontSize(10)
					.fillColor('#95a5a6')
					.text(`Filtros aplicados: ${filterText}`, {
						align: 'center',
					});
			}
		}

		doc.moveDown(1);

		// Add generation date
		doc.fontSize(10)
			.fillColor('#bdc3c7')
			.text(`Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`, {
				align: 'right',
			});

		doc.moveDown(1);

		// Check if there is data
		if (!rows || !rows.length) {
			doc.fontSize(14)
				.fillColor('#e74c3c')
				.text('Nenhum dado disponível para os filtros selecionados.', {
					align: 'center',
				});
			doc.end();
			return;
		}

		const headers = Object.keys(rows[0]);
		const pageWidth = doc.page.width - 80; // Subtract margins

		// Calcular larguras dinâmicas baseadas no conteúdo
		const headerWidths = calculateColumnWidths(headers, rows, pageWidth);

		// Table header with background
		const headerY = doc.y;
		doc.rect(40, headerY - 5, pageWidth, 25)
			.fillColor('#ecf0f1')
			.fill();

		// Header text
		doc.fillColor('#2c3e50').fontSize(9).font('Helvetica-Bold');

		let currentX = 50;
		headers.forEach((header, index) => {
			const displayHeader = formatHeaderName(header);
			doc.text(displayHeader, currentX, headerY, {
				width: headerWidths[index] - 10,
				align: 'left',
				ellipsis: true,
			});
			currentX += headerWidths[index];
		});

		doc.moveDown(1);

		// Table rows
		let isAlternate = false;
		rows.forEach((row, rowIndex) => {
			const rowY = doc.y;

			// Check if we need a new page
			if (rowY > doc.page.height - 100) {
				doc.addPage();

				// Repeat header on new page
				const newHeaderY = doc.y;
				doc.rect(40, newHeaderY - 5, pageWidth, 25)
					.fillColor('#ecf0f1')
					.fill();

				doc.fillColor('#2c3e50').fontSize(9).font('Helvetica-Bold');

				let headerX = 50;
				headers.forEach((header, index) => {
					const displayHeader = formatHeaderName(header);
					doc.text(displayHeader, headerX, newHeaderY, {
						width: headerWidths[index] - 10,
						align: 'left',
						ellipsis: true,
					});
					headerX += headerWidths[index];
				});
				doc.moveDown(1);
			}

			// Alternate row background
			if (isAlternate) {
				doc.rect(40, doc.y - 2, pageWidth, 20)
					.fillColor('#f8f9fa')
					.fill();
			}

			// Row data
			doc.fillColor('#2c3e50').fontSize(8).font('Helvetica');

			let cellX = 50;
			const currentRowY = doc.y; // Fixar Y para todas as células da linha

			headers.forEach((header, index) => {
				let value = row[header];

				// Format different data types
				if (value instanceof Date) {
					value = dayjs(value).format('DD/MM/YY HH:mm');
				} else if (value === null || value === undefined) {
					value = '-';
				} else if (
					typeof value === 'number' &&
					header.includes('duration')
				) {
					value = formatDuration(value);
				} else {
					value = String(value);
				}

				doc.text(value, cellX, currentRowY, {
					width: headerWidths[index] - 10,
					height: 15, // Altura fixa para cada célula
					align: 'left',
					ellipsis: true,
				});

				cellX += headerWidths[index];
			});

			doc.y = currentRowY + 15; // Mover Y manualmente para próxima linha
			isAlternate = !isAlternate;
		});

		// Footer
		doc.fontSize(8)
			.fillColor('#bdc3c7')
			.text(
				`Total de registros: ${rows.length}`,
				40,
				doc.page.height - 50,
			);

		doc.end();
	} catch (error) {
		console.error('Erro ao gerar PDF:', error);
		res.status(500).send('Erro ao gerar relatório PDF');
	}
}

// Helper function to calculate optimal column widths
function calculateColumnWidths(headers, rows, totalWidth) {
	const minWidth = 60; // Largura mínima para cada coluna
	const maxWidth = 150; // Largura máxima para cada coluna
	const padding = 10; // Espaçamento entre colunas

	// Definir larguras específicas para campos conhecidos
	const predefinedWidths = {
		id: 40,
		tecnico_id: 50,
		ticket_id: 50,
		categoria_id: 50,
		status: 70,
		count: 50,
		total_tickets: 60,
		duracao_media: 80,
		duracao_formatada: 80,
		duracao_ticket: 80,
		data_criacao: 90,
		data_atualizacao: 90,
		data_fechamento: 90,
		tecnico_nome: 120,
		usuario_criador: 120,
		tecnico_email: 140,
		usuario_email: 140,
		ticket_titulo: 150,
		categoria: 100,
		categoria_nome: 100,
	};

	const widths = headers.map((header) => {
		// Se temos largura predefinida, usar ela
		if (predefinedWidths[header]) {
			return predefinedWidths[header];
		}

		// Calcular baseado no comprimento do cabeçalho
		const headerLength = formatHeaderName(header).length * 8;

		// Verificar o conteúdo das primeiras linhas para estimar largura
		let maxContentLength = 0;
		for (let i = 0; i < Math.min(5, rows.length); i++) {
			const value = String(rows[i][header] || '');
			maxContentLength = Math.max(maxContentLength, value.length * 6);
		}

		const estimatedWidth =
			Math.max(headerLength, maxContentLength) + padding;
		return Math.min(Math.max(estimatedWidth, minWidth), maxWidth);
	});

	// Ajustar proporcionalmente se exceder a largura total
	const totalCalculatedWidth = widths.reduce((sum, width) => sum + width, 0);

	if (totalCalculatedWidth > totalWidth) {
		const ratio = totalWidth / totalCalculatedWidth;
		return widths.map((width) => Math.max(width * ratio, minWidth));
	}

	return widths;
}

// Helper function to format header names
function formatHeaderName(header) {
	const headerMap = {
		id: 'ID',
		titulo: 'Título',
		status: 'Status',
		categoria: 'Categoria',
		categoria_nome: 'Categoria',
		tecnico_responsavel: 'Técnico',
		tecnico_nome: 'Técnico',
		tecnico_email: 'Email Técnico',
		usuario_criador: 'Criado por',
		usuario_email: 'Email Usuário',
		data_criacao: 'Criado em',
		data_atualizacao: 'Atualizado em',
		data_fechamento: 'Fechado em',
		duracao_formatada: 'Duração',
		duracao_media: 'Duração Média',
		total_tickets: 'Total Tickets',
		count: 'Quantidade',
		patrimonio: 'Patrimônio',
		ticket_count: 'Qtd Tickets',
		avg_duration_formatted: 'Duração Média',
	};

	return (
		headerMap[header] || header.charAt(0).toUpperCase() + header.slice(1)
	);
}

// Helper function to format duration
function formatDuration(seconds) {
	if (!seconds) return '-';

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	} else if (minutes > 0) {
		return `${minutes}m ${remainingSeconds}s`;
	} else {
		return `${remainingSeconds}s`;
	}
}
