// src/utils/report-generator.js
import { Parser } from 'json2csv';
import dayjs from 'dayjs';
import sanitizeHtml from 'sanitize-html';
import process from 'process';

const DEFAULT_MAX_CONCURRENT_PAGES =
	Number(process.env.PDF_MAX_CONCURRENT_PAGES) || 6;

// =============================================================================
// CSV Export Functions
// =============================================================================

/**
 * Streams CSV data as response
 * @param {Object} res - Express response object
 * @param {Array} rows - Data rows to export
 * @param {string} filename - Output filename
 */
export function streamCsv(res, rows, filename = 'report.csv') {
	if (!rows || !rows.length) {
		rows = [{ message: 'Nenhum dado encontrado' }];
	}

	try {
		const fields = Object.keys(rows[0]);
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
		console.error('Error generating CSV:', error);
		res.status(500).send('Error generating CSV report');
	}
}

// =============================================================================
// HTML Security & Formatting Helpers
// =============================================================================

/**
 * Escapes HTML and converts newlines to <br/> tags
 * @param {*} text - Text to escape
 * @returns {string} - Sanitized HTML string
 */
function escapeHtml(text) {
	if (text === null || text === undefined) return '';

	const sanitized = sanitizeHtml(String(text), {
		allowedTags: [],
		allowedAttributes: {},
	});

	return sanitized.replace(/\n/g, '<br/>');
}

/**
 * Formats cell values for HTML display
 * @param {*} value - Value to format
 * @returns {string} - Formatted HTML string
 */
function formatCellValue(value) {
	if (value === null || value === undefined) return '';

	// Date formatting
	if (
		value instanceof Date ||
		(typeof value === 'string' && dayjs(value).isValid())
	) {
		return dayjs(value).format('DD/MM/YYYY HH:mm');
	}

	// Object formatting
	if (typeof value === 'object') {
		if (value === null) return '';
		if (value.name) return escapeHtml(value.name);
		if (value.title) return escapeHtml(value.title);
		if (value.code) return escapeHtml(value.code);

		try {
			const asJson = JSON.stringify(value);
			return escapeHtml(
				asJson.length > 300 ? asJson.slice(0, 297) + '...' : asJson,
			);
		} catch (error) {
			console.warn('Failed to stringify object:', error);
			return escapeHtml(String(value));
		}
	}

	return escapeHtml(String(value));
}

// =============================================================================
// HTML Template Builders
// =============================================================================

/**
 * Builds generic HTML report template
 * @param {Object} params - Template parameters
 * @param {string} params.title - Report title
 * @param {string} params.subtitle - Report subtitle
 * @param {Array} params.rows - Data rows
 * @param {Object} params.filters - Applied filters
 * @returns {string} - HTML string
 */
function buildGenericHtml({ title, subtitle, rows = [], filters = {} }) {
	const headers = rows && rows.length ? Object.keys(rows[0]) : [];
	const filtersText = Object.keys(filters || {}).length
		? Object.entries(filters)
				.filter(
					([k, val]) =>
						val !== undefined && val !== null && val !== '',
				)
				.map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(String(v))}`)
				.join(' | ')
		: '';

	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width,initial-scale=1"/>
	<style>
		@page { margin: 36px; }
		body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #222; }
		.title { text-align: center; font-size: 18px; font-weight: 700; margin-bottom: 2px; }
		.subtitle { text-align: center; font-size: 13px; color: #666; margin-bottom: 8px; }
		.meta { font-size: 10px; color: #888; text-align: right; margin-bottom: 6px; }
		table { width: 100%; border-collapse: collapse; font-size: 11px; }
		th, td { border: 1px solid #e8e8e8; padding: 6px 8px; vertical-align: top; text-align: left; }
		th { background: #f6f7f9; font-weight: 700; }
		tr:nth-child(even) td { background: #fbfbfb; }
		.no-data { color: #c00; text-align: center; margin-top: 60px; font-weight: 700; }
		.small { font-size: 10px; color: #666; }
		td { word-break: break-word; white-space: normal; }
		@media print {
			table { page-break-inside: auto; }
			tr { page-break-inside: avoid; page-break-after: auto; }
		}
	</style>
</head>
<body>
	<div class="title">${escapeHtml(title || 'Relatório')}</div>
	<div class="subtitle">${escapeHtml(subtitle || '')}</div>
	<div class="meta small">Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm')}${filtersText ? ' | Filtros: ' + filtersText : ''}</div>

	${
		rows && rows.length
			? `<table>
			<thead>
				<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
			</thead>
			<tbody>
				${rows.map((r) => `<tr>${headers.map((h) => `<td>${formatCellValue(r[h])}</td>`).join('')}</tr>`).join('')}
			</tbody>
		</table>`
			: `<div class="no-data">Nenhum registro encontrado para os filtros aplicados.</div>`
	}
</body>
</html>`;
}

/**
 * Builds status report HTML with bar chart (landscape orientation)
 * @param {Object} params - Template parameters
 * @returns {string} - HTML string with Chart.js bar chart
 */
function buildStatusHtml({ title, subtitle, rows = [], filters = {} }) {
	// Normalize data into label/value pairs
	const data = (rows || []).map((r) => {
		const label = r.status || r.categoria || r.tecnico || r.label || 'N/A';
		const value =
			Number(r.count ?? r.total ?? r.ticket_count ?? r.value ?? 0) || 0;
		return { label: String(label), value };
	});

	// Aggregate duplicate labels
	const aggregated = {};
	data.forEach((d) => {
		if (!aggregated[d.label]) aggregated[d.label] = 0;
		aggregated[d.label] += d.value;
	});

	const labels = Object.keys(aggregated);
	const values = labels.map((l) => aggregated[l]);

	// Color mapping for common status values
	const colorMap = {
		pendente: '#ff6b6b',
		pending: '#ff6b6b',
		'em andamento': '#ffd54f',
		in_progress: '#ffd54f',
		andamento: '#ffd54f',
		resolvido: '#67d98b',
		completed: '#67d98b',
		concluido: '#67d98b',
		closed: '#67d98b',
	};

	const palette = labels.map((l) => {
		const key = l.toLowerCase().replace(/\s+/g, '_');
		return colorMap[key] || colorMap[l.toLowerCase()] || '#6c757d';
	});

	const filtersText = Object.keys(filters || {}).length
		? Object.entries(filters)
				.filter(
					([k, val]) =>
						val !== undefined && val !== null && val !== '',
				)
				.map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(String(v))}`)
				.join(' | ')
		: '';

	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width,initial-scale=1"/>
	<title>${escapeHtml(title || 'Relatório por Status')}</title>
	<style>
		@page { margin: 30px; size: A4 landscape; }
		html,body { height: 100%; margin: 0; padding: 0; }
		body { font-family: Arial, Helvetica, sans-serif; color:#222; }
		.wrap { padding: 18px 28px; box-sizing: border-box; height: calc(100vh - 36px); }
		.header { text-align:center; }
		.title { font-size: 20px; font-weight:700; margin-bottom:4px; }
		.subtitle { font-size: 12px; color:#666; margin-bottom:6px; }
		.meta { font-size: 10px; color:#888; text-align:right; margin-bottom: 8px; }
		.content { display:flex; gap: 18px; height: calc(100% - 64px); }
		.legend { width: 18%; min-width: 120px; align-self:flex-start; }
		.legend-item { display:flex; align-items:center; gap:8px; margin-bottom:10px; font-size:13px; }
		.legend-color { width:14px; height:14px; border-radius:50%; display:inline-block; }
		.chart-area { flex: 1; display:flex; flex-direction:column; align-items:stretch; justify-content:center; }
		.bar-canvas { width: 100%; height: 420px; }
		.footer-note { text-align:center; font-size:11px; color:#666; margin-top:8px; }
	</style>
	<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
	<div class="wrap">
		<div class="header">
			<div class="title">${escapeHtml(title || 'Relatório por Status')}</div>
			<div class="subtitle">${escapeHtml(subtitle || 'Distribuição de tickets por status')}</div>
			<div class="meta small">Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm')}${filtersText ? ' | Filtros: ' + filtersText : ''}</div>
		</div>

		<div class="content">
			<div class="legend">
				${labels.map((lab, idx) => `<div class="legend-item"><span class="legend-color" style="background:${palette[idx]}"></span><div>${escapeHtml(lab)}</div></div>`).join('')}
			</div>

			<div class="chart-area">
				<canvas id="barChart" class="bar-canvas" width="1600" height="420"></canvas>
				<div class="footer-note">Distribuição absoluta por status</div>
			</div>
		</div>
	</div>

	<script>
		(function(){
			const labels = ${JSON.stringify(labels)};
			const values = ${JSON.stringify(values)};
			const colors = ${JSON.stringify(palette)};

			function renderChart() {
				const ctx = document.getElementById('barChart').getContext('2d');

				// Clean up existing chart instance
				if (window.__barChartInstance) {
					try { 
						window.__barChartInstance.destroy(); 
					} catch(error) {
						console.warn('Failed to destroy existing chart:', error);
					}
				}

				window.__barChartInstance = new Chart(ctx, {
					type: 'bar',
					data: {
						labels,
						datasets: [{
							label: 'Tickets',
							data: values,
							backgroundColor: colors,
							borderRadius: 6,
							barThickness: Math.max(20, Math.floor(1600 / Math.max(1, labels.length * 2)))
						}]
					},
					options: {
						responsive: false,
						maintainAspectRatio: false,
						plugins: { legend: { display: false } },
						layout: { padding: { top: 8, bottom: 8 } },
						scales: {
							x: {
								ticks: { color:'#222', maxRotation: 0, minRotation: 0, autoSkip: false },
								grid: { display: false }
							},
							y: {
								beginAtZero: true,
								ticks: { precision:0 },
								grid: { color: 'rgba(0,0,0,0.06)' }
							}
						}
					}
				});

				window.__charts_rendered = true;
			}

			// Wait for Chart.js to load before rendering
			if (window.Chart) {
				renderChart();
			} else {
				const checkInterval = setInterval(() => {
					if (window.Chart) {
						clearInterval(checkInterval);
						renderChart();
					}
				}, 50);
				
				// Fallback timeout
				setTimeout(() => {
					window.__charts_rendered = true;
				}, 2500);
			}
		})();
	</script>
</body>
</html>`;
}

/**
 * Builds category distribution HTML with bar chart
 * @param {Object} params - Template parameters
 * @returns {string} - HTML string with Chart.js bar chart
 */
function buildCategoryHtml({ title, subtitle, rows = [], filters = {} }) {
	// Normalize row data
	const data = (rows || []).map((r) => {
		const label =
			r.category_name || r.categoria || r.category || r.label || 'N/A';
		const value = Number(r.count ?? r.total ?? r.value ?? 0) || 0;
		return { label: String(label), value };
	});

	// Aggregate duplicate labels
	const aggregated = {};
	data.forEach((d) => {
		aggregated[d.label] = (aggregated[d.label] || 0) + d.value;
	});

	const labels = Object.keys(aggregated);
	const values = labels.map((l) => aggregated[l]);

	// Generate color palette
	const palette = labels.map((_, i) => {
		const hues = [12, 40, 80, 140, 200, 260, 320];
		return `hsl(${hues[i % hues.length]} 70% 60%)`;
	});

	const filtersText = Object.keys(filters || {}).length
		? Object.entries(filters)
				.filter(
					([k, val]) =>
						val !== undefined && val !== null && val !== '',
				)
				.map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(String(v))}`)
				.join(' | ')
		: '';

	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width,initial-scale=1"/>
	<title>${escapeHtml(title || 'Distribuição por Categoria')}</title>
	<style>
		@page { margin: 30px; size: A4 landscape; }
		html,body { height:100%; margin:0; padding:0; }
		body { font-family: Arial, Helvetica, sans-serif; color:#222; }
		.wrap { padding:18px 28px; height: calc(100vh - 36px); box-sizing: border-box; }
		.header { text-align:center; margin-bottom:8px; }
		.title { font-size:20px; font-weight:700; }
		.subtitle { font-size:12px; color:#666; margin-top:4px; }
		.meta { font-size:10px; color:#888; text-align:right; margin-top:6px; }
		.content { display:flex; gap:16px; height: calc(100% - 80px); }
		.legend { width:18%; min-width:140px; align-self:flex-start; }
		.legend-item { display:flex; align-items:center; gap:8px; margin-bottom:10px; font-size:13px; }
		.legend-color { width:14px; height:14px; border-radius:50%; display:inline-block; }
		.chart-area { flex:1; display:flex; flex-direction:column; align-items:stretch; justify-content:center; }
		.bar-canvas { width:100%; height:420px; }
		.footer-note { text-align:center; font-size:11px; color:#666; margin-top:8px; }
	</style>
	<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
	<div class="wrap">
		<div class="header">
			<div class="title">${escapeHtml(title || 'Distribuição de Tickets por Categoria')}</div>
			<div class="subtitle">${escapeHtml(subtitle || '')}</div>
			<div class="meta">Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm')}${filtersText ? ' | Filtros: ' + filtersText : ''}</div>
		</div>

		<div class="content">
			<div class="legend">
				${labels.map((lab, idx) => `<div class="legend-item"><span class="legend-color" style="background:${palette[idx]}"></span><div>${escapeHtml(lab)}</div></div>`).join('')}
			</div>

			<div class="chart-area">
				<canvas id="categoryBar" class="bar-canvas" width="1600" height="420"></canvas>
				<div class="footer-note">Contagem absoluta por categoria</div>
			</div>
		</div>
	</div>

	<script>
		(function(){
			const labels = ${JSON.stringify(labels)};
			const values = ${JSON.stringify(values)};
			const colors = ${JSON.stringify(palette)};

			function renderChart() {
				const ctx = document.getElementById('categoryBar').getContext('2d');
				
				if (window.__categoryChart) {
					try { 
						window.__categoryChart.destroy(); 
					} catch(error) {
						console.warn('Failed to destroy existing chart:', error);
					}
				}
				
				window.__categoryChart = new Chart(ctx, {
					type: 'bar',
					data: { 
						labels, 
						datasets: [{ 
							data: values, 
							backgroundColor: colors, 
							borderRadius:6, 
							barThickness: Math.max(20, Math.floor(1600 / Math.max(1, labels.length * 2))) 
						}] 
					},
					options: {
						responsive: false,
						maintainAspectRatio: false,
						plugins: { legend: { display:false } },
						scales: { 
							x: { grid:{display:false}, ticks:{autoSkip:false} }, 
							y: { beginAtZero:true, grid:{color:'rgba(0,0,0,0.06)'} } 
						}
					}
				});

				window.__charts_rendered = true;
			}

			if (window.Chart) {
				renderChart();
			} else {
				const checkInterval = setInterval(() => {
					if (window.Chart) {
						clearInterval(checkInterval);
						renderChart();
					}
				}, 50);
				
				setTimeout(() => {
					window.__charts_rendered = true;
				}, 2500);
			}
		})();
	</script>
</body>
</html>`;
}

/**
 * Builds technician activity report with bar chart and summary cards
 * @param {Object} params - Template parameters
 * @returns {string} - HTML string with Chart.js and cards layout
 */
function buildTechnicianHtml({ title, subtitle, rows = [], filters = {} }) {
	// Normalize technician data
	const normalized = (rows || []).map((r) => {
		const name =
			r.technician_name || r.tecnico || r.name || r.label || 'N/A';
		const email = r.technician_email || r.email || r.user_email || '';
		const tickets =
			Number(r.ticket_count ?? r.total_tickets ?? r.count ?? 0) || 0;
		const avgSec =
			Number(r.avg_duration_seconds ?? r.avg_duration ?? 0) || 0;
		const avgLabel =
			r.avg_duration_formatted ||
			r.duracao_media ||
			(avgSec ? Math.floor(avgSec / 3600) + 'h' : '-');

		// Map recent tickets if available
		const recent = Array.isArray(r.recentTickets)
			? r.recentTickets
					.slice(0, 5)
					.map((t) => (t.title || t.titulo || t.id || '').toString())
			: [];

		return {
			name: String(name),
			email: String(email),
			tickets,
			avgSec,
			avgLabel,
			recent,
		};
	});

	// Sort by ticket count for chart display
	const sorted = [...normalized].sort((a, b) => b.tickets - a.tickets);
	const labels = sorted.map((s) => s.name);
	const values = sorted.map((s) => s.tickets);
	const palette = labels.map((_, i) => `hsl(${(i * 40) % 360} 70% 55%)`);

	const filtersText = Object.keys(filters || {}).length
		? Object.entries(filters)
				.filter(
					([k, val]) =>
						val !== undefined && val !== null && val !== '',
				)
				.map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(String(v))}`)
				.join(' | ')
		: '';

	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width,initial-scale=1"/>
	<title>${escapeHtml(title || 'Relatório de Atividade dos Técnicos')}</title>
	<style>
		@page { margin: 28px; size: A4 landscape; }
		html,body { height:100%; margin:0; padding:0; }
		body { font-family: Arial, Helvetica, sans-serif; color:#222; }
		.wrap { padding:14px 20px; height: calc(100vh - 36px); box-sizing: border-box; }
		.header { text-align:center; }
		.title { font-size:20px; font-weight:700; }
		.subtitle { font-size:12px; color:#666; margin-top:4px; }
		.meta { font-size:10px; color:#888; text-align:right; margin-top:6px; }
		.chart-row { margin-top:12px; height: 46%; display:flex; align-items:center; justify-content:center; }
		.chart-canvas { width: 95%; height: 100%; }
		.cards { margin-top:10px; display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; height: 44%; overflow: hidden; }
		.card { border:1px solid #e6e6e6; border-radius:8px; padding:10px; background:#fff; box-shadow:0 1px 0 rgba(0,0,0,0.02); font-size:12px; }
		.card h3 { margin:0; font-size:14px; }
		.card p { margin:4px 0; color:#555; font-size:12px; }
		.recent { margin-top:6px; font-size:11px; color:#666; max-height:60px; overflow:auto; }
		.small { font-size:11px; color:#666; }
	</style>
	<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
	<div class="wrap">
		<div class="header">
			<div class="title">${escapeHtml(title || 'Relatório de Atividade dos Técnicos')}</div>
			<div class="subtitle">${escapeHtml(subtitle || '')}</div>
			<div class="meta">Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm')}${filtersText ? ' | Filtros: ' + filtersText : ''}</div>
		</div>

		<div class="chart-row">
			<canvas id="techBar" class="chart-canvas" width="2200" height="320"></canvas>
		</div>

		<div class="cards">
			${normalized
				.map(
					(t) => `
				<div class="card">
					<h3>${escapeHtml(t.name)}</h3>
					<p class="small">${escapeHtml(t.email)}</p>
					<p><strong>Tickets:</strong> ${t.tickets} &nbsp; <strong>Avg:</strong> ${escapeHtml(t.avgLabel)}</p>
					${t.recent && t.recent.length ? `<div class="recent"><strong>Recentes:</strong><ul>${t.recent.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>` : ''}
				</div>
			`,
				)
				.join('')}
		</div>
	</div>

	<script>
		(function(){
			const labels = ${JSON.stringify(labels)};
			const values = ${JSON.stringify(values)};
			const colors = ${JSON.stringify(palette)};

			function renderChart() {
				const ctx = document.getElementById('techBar').getContext('2d');
				
				if (window.__techChart) {
					try { 
						window.__techChart.destroy(); 
					} catch(error) {
						console.warn('Failed to destroy existing chart:', error);
					}
				}
				
				window.__techChart = new Chart(ctx, {
					type: 'bar',
					data: { 
						labels, 
						datasets: [{ 
							data: values, 
							backgroundColor: colors, 
							borderRadius:6, 
							barThickness: Math.max(16, Math.floor(2200 / Math.max(1, labels.length * 3))) 
						}] 
					},
					options: {
						responsive: false,
						maintainAspectRatio: false,
						plugins: { legend: { display:false } },
						scales: { 
							x: { grid:{display:false}, ticks:{autoSkip:false} }, 
							y: { beginAtZero:true, grid:{color:'rgba(0,0,0,0.06)'} } 
						}
					}
				});
				
				window.__charts_rendered = true;
			}

			if (window.Chart) {
				renderChart();
			} else {
				const checkInterval = setInterval(() => {
					if (window.Chart) {
						clearInterval(checkInterval);
						renderChart();
					}
				}, 50);
				
				setTimeout(() => {
					window.__charts_rendered = true;
				}, 2500);
			}
		})();
	</script>
</body>
</html>`;
}

// =============================================================================
// Puppeteer PDF Rendering
// =============================================================================

let _browser = null;
let _activePages = 0;
const _queue = [];

/**
 * Dynamically imports Puppeteer module
 * @returns {Object} - Puppeteer instance
 */
async function _importPuppeteer() {
	const mod = await import('puppeteer');
	return mod.default || mod;
}

/**
 * Ensures browser instance is available (singleton pattern)
 * @returns {Object} - Puppeteer browser instance
 */
async function ensureBrowser() {
	if (_browser) return _browser;

	const puppeteer = await _importPuppeteer();
	_browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});

	return _browser;
}

/**
 * Acquires a slot for concurrent page processing
 * @param {number} maxConcurrent - Maximum concurrent pages
 * @returns {Promise} - Resolves when slot is available
 */
function _acquireSlot(maxConcurrent = DEFAULT_MAX_CONCURRENT_PAGES) {
	return new Promise((resolve) => {
		if (_activePages < maxConcurrent) {
			_activePages += 1;
			resolve();
			return;
		}
		_queue.push(resolve);
	});
}

/**
 * Releases a processing slot and processes queue
 */
function _releaseSlot() {
	_activePages = Math.max(0, _activePages - 1);

	if (_queue.length > 0) {
		const next = _queue.shift();
		_activePages += 1;
		next();
	}
}

/**
 * Renders HTML to PDF using Puppeteer
 * @param {Object} params - Rendering parameters
 * @param {string} params.html - HTML content to render
 * @param {Object} params.pdfOptions - PDF generation options
 * @param {boolean} params.waitForCharts - Whether to wait for charts to render
 * @returns {Buffer} - PDF buffer
 */
async function renderWithPuppeteer({
	html,
	pdfOptions = {},
	waitForCharts = false,
}) {
	await ensureBrowser();
	await _acquireSlot();

	let page;
	try {
		page = await _browser.newPage();

		// Set viewport for landscape A4
		await page.setViewport({ width: 1600, height: 900 });

		// Optimize loading by blocking heavy resources
		await page.setRequestInterception(true);
		page.on('request', (req) => {
			const resourceType = req.resourceType();
			if (['image', 'font', 'media'].includes(resourceType)) {
				return req.abort();
			}
			return req.continue();
		});

		// Load HTML content
		await page.setContent(html, { waitUntil: 'load', timeout: 0 });

		// Wait for charts to render if needed
		if (waitForCharts) {
			try {
				await page.waitForFunction(
					'window.__charts_rendered === true',
					{ timeout: 3000 },
				);
			} catch (error) {
				console.warn(
					'Timeout waiting for charts to render, proceeding with PDF generation:',
					error,
				);
			}
		}

		// Generate PDF
		const buffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			margin: {
				top: '30px',
				right: '30px',
				bottom: '30px',
				left: '30px',
			},
			landscape: true,
			...pdfOptions,
		});

		return buffer;
	} finally {
		// Clean up page resources
		try {
			if (page) {
				try {
					page.removeAllListeners('request');
				} catch (error) {
					console.warn('Failed to remove request listeners:', error);
				}

				await page.setRequestInterception(false).catch((error) => {
					console.warn(
						'Failed to disable request interception:',
						error,
					);
				});

				await page.close();
			}
		} catch (error) {
			console.warn('Failed to close page:', error);
		}

		_releaseSlot();
	}
}

// =============================================================================
// Main PDF Export Function
// =============================================================================

/**
 * Streams PDF report as response
 * @param {Object} res - Express response object
 * @param {Object} params - Report parameters
 * @param {string} params.title - Report title
 * @param {string} params.subtitle - Report subtitle
 * @param {Object} params.filters - Applied filters
 * @param {Array} params.rows - Data rows
 * @param {string} params.type - Report type (status, category, technician, list)
 */
export async function streamPdf(
	res,
	{ title, subtitle, filters, rows = [], type },
) {
	try {
		const reportType = String(type).toLowerCase();
		const headers = rows && rows.length ? Object.keys(rows[0]) : [];

		// Determine if landscape orientation is needed
		const landscape =
			reportType === 'status' ||
			reportType === 'list' ||
			headers.length > 6;

		let html;
		let waitForCharts = false;

		// Select appropriate template based on report type
		switch (reportType) {
			case 'status':
				html = buildStatusHtml({ title, subtitle, rows, filters });
				waitForCharts = true;
				break;

			case 'type':
			case 'category':
				html = buildCategoryHtml({ title, subtitle, rows, filters });
				waitForCharts = true;
				break;

			case 'technician':
			case 'tech':
				html = buildTechnicianHtml({ title, subtitle, rows, filters });
				waitForCharts = true;
				break;

			default:
				html = buildGenericHtml({ title, subtitle, rows, filters });
				break;
		}

		const pdfOptions = {
			format: 'A4',
			margin: {
				top: '30px',
				right: '30px',
				bottom: '30px',
				left: '30px',
			},
			landscape,
		};

		const buffer = await renderWithPuppeteer({
			html,
			pdfOptions,
			waitForCharts,
		});

		// Set response headers and send PDF
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="relatorio_${type || 'report'}_${Date.now()}.pdf"`,
		);
		res.send(buffer);
	} catch (error) {
		console.error('Error generating PDF with Puppeteer:', error);
		res.status(500).send('Error generating PDF report');
	}
}

// =============================================================================
// Cleanup Function
// =============================================================================

/**
 * Gracefully closes the PDF browser instance
 * Should be called during application shutdown
 */
export async function closePdfBrowser() {
	try {
		if (_browser) {
			await _browser.close();
			_browser = null;
		}
	} catch (error) {
		console.warn('Failed to close PDF browser:', error);
	}
}
