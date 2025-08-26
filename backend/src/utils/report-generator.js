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
			delimiter: ';',
			quote: '"',
			escapedQuote: '""',
			withBOM: true,
			eol: '\r\n',
		});

		const csv = parser.parse(rows);

		res.setHeader('Content-Type', 'text/csv; charset=utf-8');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${filename}"`,
		);
		res.setHeader('Cache-Control', 'no-cache');
		res.status(200).send('\uFEFF' + csv);
	} catch (error) {
		console.error('Erro ao gerar CSV:', error);
		res.status(500).send('Erro ao gerar relatório CSV');
	}
}

export function streamPdf(res, { title, subtitle, filters, rows, type }) {
	try {
		const doc = new PDFDocument({
			size: 'A4',
			margin: 40,
			layout: 'portrait',
			bufferPages: true,
		});

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="relatorio_${type}_${Date.now()}.pdf"`,
		);

		doc.pipe(res);

		// Constantes para layout
		const PAGE_MARGIN = 40;
		const HEADER_HEIGHT = 100; // Altura do header
		const ITEM_HEIGHT = 75; // Altura fixa de cada item
		const FOOTER_HEIGHT = 30; // Margem inferior
		const USABLE_HEIGHT =
			doc.page.height - PAGE_MARGIN - HEADER_HEIGHT - FOOTER_HEIGHT;

		let isFirstPage = true;

		// Função para desenhar header da página
		function drawPageHeader() {
			const startY = PAGE_MARGIN;
			doc.y = startY;

			// Quantidade de registros (apenas na primeira página)
			if (isFirstPage) {
				doc.fontSize(10)
					.fillColor('#6c757d')
					.font('Helvetica-Bold')
					.text(`${rows.length} registros`, PAGE_MARGIN, doc.y);
			}

			// Título principal
			doc.fontSize(16)
				.fillColor('#2c3e50')
				.font('Helvetica-Bold')
				.text(
					title || 'Relatório de Tickets',
					PAGE_MARGIN,
					doc.y + 15,
					{
						align: 'center',
						width: doc.page.width - PAGE_MARGIN * 2,
					},
				);

			// Subtítulo
			if (subtitle) {
				doc.fontSize(10)
					.fillColor('#6c757d')
					.font('Helvetica')
					.text(subtitle, PAGE_MARGIN, doc.y + 5, {
						align: 'center',
						width: doc.page.width - PAGE_MARGIN * 2,
					});
			}

			// Data de geração no canto direito
			doc.fontSize(8)
				.fillColor('#adb5bd')
				.text(
					`Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm')}`,
					doc.page.width - 150,
					startY,
					{ width: 100, align: 'right' },
				);

			// Filtros (apenas na primeira página)
			if (filters && Object.keys(filters).length > 0 && isFirstPage) {
				const filterText = Object.entries(filters)
					.filter(
						([key, value]) =>
							value !== undefined &&
							value !== null &&
							value !== '',
					)
					.map(([key, value]) => {
						if (key.includes('Date') || key.includes('data')) {
							return `${formatHeaderName(key)}: ${dayjs(value).format('DD/MM/YYYY')}`;
						}
						return `${formatHeaderName(key)}: ${value}`;
					})
					.join(' | ');

				if (filterText) {
					doc.fontSize(8)
						.fillColor('#495057')
						.font('Helvetica-Oblique')
						.text(
							`Filtros: ${filterText}`,
							PAGE_MARGIN,
							doc.y + 10,
							{
								align: 'center',
								width: doc.page.width - PAGE_MARGIN * 2,
							},
						);
				}
			}

			// Posicionar y no final do header
			doc.y = startY + HEADER_HEIGHT;
			return doc.y;
		}

		// Verificar se há dados
		if (!rows || !rows.length) {
			drawPageHeader();
			doc.fontSize(14)
				.fillColor('#dc3545')
				.font('Helvetica-Bold')
				.text('Nenhum registro encontrado para os filtros aplicados.', {
					align: 'center',
				});
			doc.end();
			return;
		}

		// Desenhar header inicial
		let currentY = drawPageHeader();
		isFirstPage = false;

		// Processar itens
		rows.forEach((row, index) => {
			// Verificar se há espaço suficiente para o próximo item
			if (currentY + ITEM_HEIGHT > doc.page.height - FOOTER_HEIGHT) {
				doc.addPage();
				currentY = drawPageHeader();
			}

			currentY = drawListItem(doc, row, index + 1, currentY);
		});

		doc.end();
	} catch (error) {
		console.error('Erro ao gerar PDF:', error);
		res.status(500).send('Erro ao gerar relatório PDF');
	}
}

function drawListItem(doc, item, itemNumber, startY) {
	const ITEM_HEIGHT = 75;
	const MARGIN = 40;

	// Background alternado mais sutil
	if (itemNumber % 2 === 0) {
		doc.rect(
			MARGIN - 5,
			startY,
			doc.page.width - MARGIN * 2 + 10,
			ITEM_HEIGHT,
		)
			.fillColor('#f8f9fa')
			.fill();
	}

	// Linha de separação superior
	doc.strokeColor('#e9ecef')
		.lineWidth(0.5)
		.moveTo(MARGIN, startY + 5)
		.lineTo(doc.page.width - MARGIN, startY + 5)
		.stroke();

	let currentY = startY + 15;

	// Primeira linha - Número do item e ID
	doc.fontSize(12)
		.fillColor('#2c3e50')
		.font('Helvetica-Bold')
		.text(`#${itemNumber}`, MARGIN + 5, currentY);

	if (item.id) {
		doc.fontSize(10)
			.fillColor('#6c757d')
			.font('Helvetica')
			.text(`ID: ${item.id}`, MARGIN + 35, currentY + 1);
	}

	// Status badge no canto direito
	if (item.status) {
		const statusColor = getStatusColor(item.status);
		const statusX = doc.page.width - 120;

		doc.rect(statusX, currentY - 2, 70, 16)
			.fillColor(statusColor)
			.fill();

		doc.fontSize(8)
			.fillColor('#ffffff')
			.font('Helvetica-Bold')
			.text(
				String(item.status).toUpperCase(),
				statusX + 2,
				currentY + 2,
				{
					width: 66,
					align: 'center',
				},
			);
	}

	currentY += 20;

	// Segunda linha - Título
	if (item.titulo) {
		doc.fontSize(11)
			.fillColor('#2c3e50')
			.font('Helvetica-Bold')
			.text('Título: ', MARGIN + 5, currentY, { continued: true });

		doc.fontSize(10)
			.fillColor('#495057')
			.font('Helvetica')
			.text(limitText(item.titulo, 65));
	}

	currentY += 15;

	// Terceira linha - Categoria e Solicitante
	doc.fontSize(9).fillColor('#495057').font('Helvetica');

	if (item.categoria || item.categoria_nome) {
		doc.text(
			`Categoria: ${item.categoria || item.categoria_nome}`,
			MARGIN + 5,
			currentY,
		);
	}

	if (item.usuario_criador || item.criado_por) {
		const solicitante = item.usuario_criador || item.criado_por;
		doc.text(
			`Solicitante: ${limitText(solicitante, 20)}`,
			MARGIN + 5,
			currentY + 10,
		);
	}

	// Lado direito - Técnico e Data
	if (item.tecnico_nome || item.tecnico_responsavel) {
		const tecnico =
			item.tecnico_nome || item.tecnico_responsavel || 'Não atribuído';
		doc.text(
			`Técnico: ${limitText(tecnico, 20)}`,
			doc.page.width - 180,
			currentY,
		);
	}

	if (item.data_criacao || item.criado_em) {
		doc.text(
			`Criado: ${formatDate(item.data_criacao || item.criado_em)}`,
			doc.page.width - 180,
			currentY + 10,
		);
	}

	return startY + ITEM_HEIGHT + 5; // Retorna próxima posição Y
}

function getStatusColor(status) {
	const statusColors = {
		pendente: '#ffc107',
		pending: '#ffc107',
		em_andamento: '#17a2b8',
		'em andamento': '#17a2b8',
		in_progress: '#17a2b8',
		concluido: '#28a745',
		concluído: '#28a745',
		completed: '#28a745',
		fechado: '#28a745',
		closed: '#28a745',
		cancelado: '#dc3545',
		cancelled: '#dc3545',
		aberto: '#fd7e14',
		open: '#fd7e14',
	};

	const key = String(status).toLowerCase().replace(/\s+/g, '_');
	return (
		statusColors[key] ||
		statusColors[String(status).toLowerCase()] ||
		'#6c757d'
	);
}

function formatDate(date) {
	if (!date) return 'N/A';

	try {
		if (date instanceof Date) {
			return dayjs(date).format('DD/MM/YY HH:mm');
		}

		const parsedDate = dayjs(date);
		if (parsedDate.isValid()) {
			return parsedDate.format('DD/MM/YY HH:mm');
		}

		return String(date);
	} catch (error) {
		return String(date);
	}
}

function limitText(text, maxLength) {
	if (!text) return 'N/A';
	const str = String(text);
	return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

function formatHeaderName(header) {
	const headerMap = {
		status: 'Status',
		data_inicio: 'Data Início',
		data_fim: 'Data Fim',
		categoria: 'Categoria',
		tecnico: 'Técnico',
		usuario: 'Usuário',
	};

	return (
		headerMap[header] || header.charAt(0).toUpperCase() + header.slice(1)
	);
}

function formatDuration(seconds) {
	if (!seconds || seconds === 0) return '-';

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
