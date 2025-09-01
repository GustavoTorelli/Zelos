import React, { useState, useEffect } from 'react';
import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from 'recharts';
import {
	Calendar,
	Filter,
	Users,
	Tag,
	BarChart3,
	RefreshCw,
	Download,
	FileText,
	AlertCircle,
} from 'lucide-react';

export default function ReportGraphics() {
	const [reportData, setReportData] = useState([]);
	const [categories, setCategories] = useState([]);
	const [technicians, setTechnicians] = useState([]);
	const [reportType, setReportType] = useState('status');
	const [filters, setFilters] = useState({
		technicianId: '',
		categoryId: '',
		status: '',
		startDate: '',
		endDate: '',
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [downloading, setDownloading] = useState(false);

	// Status mapping with colors and Portuguese labels
	const statusConfig = {
		pending: { label: 'Pendente', color: '#F59E0B' },
		in_progress: { label: 'Em Andamento', color: '#3B82F6' },
		completed: { label: 'Concluído', color: '#10B981' },
	};

	// Report type configurations
	const reportTypes = {
		status: { label: 'Por Status', icon: BarChart3 },
		type: { label: 'Por Categoria', icon: Tag },
		technician: { label: 'Por Técnico', icon: Users },
		list: { label: 'Lista Completa', icon: FileText },
	};

	// Fetch initial data (categories and technicians)
	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const token =
					typeof window !== 'undefined'
						? localStorage.getItem('token')
						: '';
				const headers = {
					'Content-Type': 'application/json',
					...(token && { Authorization: `Bearer ${token}` }),
				};

				// Busca técnicos com role=technician na query
				const [categoriesRes, techniciansRes] = await Promise.all([
					fetch('/api/categories', { headers }),
					fetch('/api/users?role=technician', { headers }),
				]);

				if (!categoriesRes.ok || !techniciansRes.ok) {
					throw new Error('Erro ao carregar dados iniciais');
				}

				const categoriesData = await categoriesRes.json();
				const techniciansData = await techniciansRes.json();

				// Ajusta arrays baseado na estrutura de resposta da API
				const categoriesArray = Array.isArray(categoriesData.data)
					? categoriesData.data
					: Array.isArray(categoriesData.categories)
					? categoriesData.categories
					: Array.isArray(categoriesData)
					? categoriesData
					: [];

				const techniciansArray = Array.isArray(techniciansData.data)
					? techniciansData.data
					: Array.isArray(techniciansData.users)
					? techniciansData.users
					: Array.isArray(techniciansData)
					? techniciansData
					: [];

				setCategories(categoriesArray);
				setTechnicians(techniciansArray);
			} catch (err) {
				console.error('Erro no fetch inicial:', err);
				setError(err.message || 'Erro desconhecido');
			}
		};

		fetchInitialData();
	}, []);

	// Fetch report data
	useEffect(() => {
		const fetchReportData = async () => {
			try {
				setLoading(true);
				setError(null);

				const token =
					typeof window !== 'undefined'
						? localStorage.getItem('token')
						: '';
				const headers = {
					'Content-Type': 'application/json',
					...(token && { Authorization: `Bearer ${token}` }),
				};

				const params = new URLSearchParams();
				params.append('type', reportType);
				params.append('format', 'json');

				if (filters.technicianId)
					params.append('technician_id', filters.technicianId);
				if (filters.categoryId)
					params.append('category_id', filters.categoryId);
				if (filters.status) params.append('status', filters.status);
				if (filters.startDate)
					params.append('start_date', filters.startDate);
				if (filters.endDate) params.append('end_date', filters.endDate);

				const url = `/api/reports?${params.toString()}`;
				const response = await fetch(url, { headers });

				if (!response.ok)
					throw new Error(
						`Erro ao carregar relatório: ${response.status}`
					);

				const result = await response.json();
				setReportData(result.data || []);
			} catch (err) {
				console.error('Error fetching report:', err);
				setError('Erro ao carregar relatório');
				setReportData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchReportData();
	}, [reportType, filters]);

	// Generate file download
	const downloadReport = async (format) => {
		try {
			setDownloading(true);

			const token =
				typeof window !== 'undefined'
					? localStorage.getItem('token')
					: '';
			const headers = {
				...(token && { Authorization: `Bearer ${token}` }),
			};

			const params = new URLSearchParams();
			params.append('type', reportType);
			params.append('format', format);

			if (filters.technicianId)
				params.append('technician_id', filters.technicianId);
			if (filters.categoryId)
				params.append('category_id', filters.categoryId);
			if (filters.status) params.append('status', filters.status);
			if (filters.startDate)
				params.append('start_date', filters.startDate);
			if (filters.endDate) params.append('end_date', filters.endDate);

			const url = `/api/reports?${params.toString()}`;
			const response = await fetch(url, { headers });

			if (!response.ok)
				throw new Error(`Erro ao gerar relatório: ${response.status}`);

			// Handle file download
			const blob = await response.blob();
			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = `relatorio_${reportType}_${
				new Date().toISOString().split('T')[0]
			}.${format}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(downloadUrl);
		} catch (err) {
			console.error('Error downloading report:', err);
			setError('Erro ao baixar relatório');
		} finally {
			setDownloading(false);
		}
	};

	// Prepare chart data based on report type
	const getChartData = () => {
		if (!reportData.length) return [];

		switch (reportType) {
			case 'status':
				return reportData.map((item) => ({
					name: statusConfig[item.status]?.label || item.status,
					value: item.count,
					color: statusConfig[item.status]?.color || '#6B7280',
					percentage: Math.round(
						(item.count /
							reportData.reduce((sum, d) => sum + d.count, 0)) *
							100
					),
				}));

			case 'type':
				const colors = [
					'#EF4444',
					'#F97316',
					'#F59E0B',
					'#10B981',
					'#3B82F6',
					'#8B5CF6',
					'#EC4899',
				];
				return reportData.map((item, index) => ({
					name: item.categoria,
					value: item.count,
					color: colors[index % colors.length],
					percentage: Math.round(
						(item.count /
							reportData.reduce((sum, d) => sum + d.count, 0)) *
							100
					),
				}));

			case 'technician':
				const techColors = [
					'#10B981',
					'#3B82F6',
					'#F59E0B',
					'#EF4444',
					'#8B5CF6',
				];
				return reportData.map((item, index) => ({
					name: item.tecnico,
					value: item.total_tickets,
					color: techColors[index % techColors.length],
					percentage: Math.round(
						(item.total_tickets /
							reportData.reduce(
								(sum, d) => sum + d.total_tickets,
								0
							)) *
							100
					),
					avgDuration: item.duracao_media,
				}));

			case 'list':
				// Para lista completa, agrupamos os tickets por status para mostrar distribuição
				const statusGroups = {};
				reportData.forEach((ticket) => {
					const status = ticket.status || 'unknown';
					if (!statusGroups[status]) {
						statusGroups[status] = 0;
					}
					statusGroups[status]++;
				});

				const total = reportData.length;
				const listColors = [
					'#EF4444',
					'#F59E0B',
					'#10B981',
					'#3B82F6',
					'#8B5CF6',
				];

				return Object.entries(statusGroups).map(
					([status, count], index) => ({
						name: statusConfig[status]?.label || status,
						value: count,
						color:
							statusConfig[status]?.color ||
							listColors[index % listColors.length],
						percentage: Math.round((count / total) * 100),
					})
				);

			default:
				return [];
		}
	};

	const chartData = getChartData();
	const totalCount =
		reportType === 'list'
			? reportData.length
			: chartData.reduce((sum, item) => sum + item.value, 0);

	// Debug logs (remover depois)
	console.log('Report Type:', reportType);
	console.log('Report Data:', reportData);
	console.log('Chart Data:', chartData);
	console.log('Total Count:', totalCount);

	// Refresh data function
	const refreshData = () => {
		setLoading(true);
		setFilters({
			technicianId: '',
			categoryId: '',
			status: '',
			startDate: '',
			endDate: '',
		});
	};

	if (loading) {
		return (
			<div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl p-6">
				<div className="flex items-center justify-center h-96">
					<div className="flex flex-col items-center gap-4">
						<RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
						<div className="text-white text-lg">
							Carregando relatório...
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl p-6">
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
						<div className="text-red-400 text-lg mb-2">
							Erro ao carregar dados
						</div>
						<div className="text-gray-400 text-sm mb-4">
							{error}
						</div>
						<button
							onClick={refreshData}
							className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors duration-200"
						>
							Tentar novamente
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Filters and Controls */}
			<div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Report Type Selection */}
					<div className="flex-1">
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Tipo de Relatório
						</label>
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
							{Object.entries(reportTypes).map(
								([key, config]) => {
									const Icon = config.icon;
									return (
										<button
											key={key}
											onClick={() => setReportType(key)}
											className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
												reportType === key
													? 'bg-red-600/20 border-red-500/50 text-red-400'
													: 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:bg-gray-600/50'
											}`}
										>
											<Icon className="w-4 h-4" />
											{config.label}
										</button>
									);
								}
							)}
						</div>
					</div>

					{/* Download Buttons */}
					<div className="flex flex-col gap-2">
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Baixar Relatório
						</label>
						<div className="flex gap-2">
							<button
								onClick={() => downloadReport('csv')}
								disabled={downloading}
								className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 disabled:bg-gray-600 rounded-lg text-white text-sm transition-colors duration-200 flex items-center gap-2 cursor-pointer"
							>
								<Download className="w-4 h-4" />
								CSV
							</button>
							<button
								onClick={() => downloadReport('pdf')}
								disabled={downloading}
								className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg text-white text-sm transition-colors duration-200 flex items-center gap-2 cursor-pointer"
							>
								<Download className="w-4 h-4" />
								PDF
							</button>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
					<div className="relative">
						<Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
						<input
							type="date"
							value={filters.startDate}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									startDate: e.target.value,
								}))
							}
							className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25"
							placeholder="Data inicial"
						/>
					</div>

					<div className="relative">
						<Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
						<input
							type="date"
							value={filters.endDate}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									endDate: e.target.value,
								}))
							}
							className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25"
							placeholder="Data final"
						/>
					</div>

					<div className="relative">
						<Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
						<select
							value={filters.technicianId}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									technicianId: e.target.value,
								}))
							}
							className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25"
						>
							<option value="">Todos os técnicos</option>
							{technicians.map((tech) => (
								<option key={tech.id} value={tech.id}>
									{tech.name}
								</option>
							))}
						</select>
					</div>

					<div className="relative">
						<Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
						<select
							value={filters.categoryId}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									categoryId: e.target.value,
								}))
							}
							className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25"
						>
							<option value="">Todas as categorias</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.title}
								</option>
							))}
						</select>
					</div>

					<div className="relative">
						<Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
						<select
							value={filters.status}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									status: e.target.value,
								}))
							}
							className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25"
						>
							<option value="">Todos os status</option>
							{Object.entries(statusConfig).map(
								([key, config]) => (
									<option key={key} value={key}>
										{config.label}
									</option>
								)
							)}
						</select>
					</div>
				</div>
			</div>

			{/* Chart Display */}
			<div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl p-6">
				<div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-auto p-4 relative">
					{/* Background glow */}
					<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl"></div>

					<div className="relative z-10">
						{/* Header */}
						<div className="flex justify-between items-start mb-6">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400/20 to-red-600/20 flex items-center justify-center shadow-lg">
									<BarChart3 className="w-6 h-6 text-white" />
								</div>
								<div>
									<h3 className="text-xl font-bold text-white mb-1">
										{reportTypes[reportType].label}
									</h3>
									<p className="text-gray-400 text-sm">
										{totalCount}{' '}
										{reportType === 'technician'
											? 'técnicos'
											: 'registros'}{' '}
										encontrados
									</p>
								</div>
							</div>

							<button
								onClick={refreshData}
								className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg border border-gray-600/50 transition-colors duration-200"
								title="Atualizar dados"
							>
								<RefreshCw className="w-4 h-4 text-gray-400" />
							</button>
						</div>

						{/* Chart Content */}
						{(reportType === 'list' && reportData.length > 0) ||
						(reportType !== 'list' && totalCount > 0) ? (
							reportType === 'list' ? (
								// Table view for list type
								<div className="w-full">
									<div className="bg-gray-700/30 rounded-lg overflow-hidden">
										<div className="max-h-96 overflow-y-auto">
											<table className="w-full text-sm">
												<thead className="bg-gray-800/50 sticky top-0">
													<tr>
														<th className="px-4 py-3 text-left text-gray-300 font-medium">
															ID
														</th>
														<th className="px-4 py-3 text-left text-gray-300 font-medium">
															Título
														</th>
														<th className="px-4 py-3 text-left text-gray-300 font-medium">
															Status
														</th>
														<th className="px-4 py-3 text-left text-gray-300 font-medium">
															Categoria
														</th>
														<th className="px-4 py-3 text-left text-gray-300 font-medium">
															Técnico
														</th>
														<th className="px-4 py-3 text-left text-gray-300 font-medium">
															Criado em
														</th>
													</tr>
												</thead>
												<tbody>
													{reportData
														.slice(0, 100)
														.map(
															(ticket, index) => (
																<tr
																	key={
																		ticket.id ||
																		index
																	}
																	className="border-t border-gray-600/30 hover:bg-gray-600/20"
																>
																	<td className="px-4 py-3 text-gray-300">
																		#
																		{
																			ticket.id
																		}
																	</td>
																	<td className="px-4 py-3 text-white font-medium">
																		<div
																			className="truncate max-w-xs"
																			title={
																				ticket.titulo
																			}
																		>
																			{ticket.titulo ||
																				ticket.title ||
																				'Sem título'}
																		</div>
																	</td>
																	<td className="px-4 py-3">
																		<span
																			className="inline-flex px-2 py-1 rounded-full text-xs font-medium"
																			style={{
																				backgroundColor: `${
																					statusConfig[
																						ticket
																							.status
																					]
																						?.color ||
																					'#6B7280'
																				}20`,
																				color:
																					statusConfig[
																						ticket
																							.status
																					]
																						?.color ||
																					'#9CA3AF',
																			}}
																		>
																			{statusConfig[
																				ticket
																					.status
																			]
																				?.label ||
																				ticket.status ||
																				'Desconhecido'}
																		</span>
																	</td>
																	<td className="px-4 py-3 text-gray-300">
																		{ticket.categoria ||
																			ticket.category ||
																			'N/A'}
																	</td>
																	<td className="px-4 py-3 text-gray-300">
																		{ticket.tecnico_responsavel ||
																			ticket.technician ||
																			'Não atribuído'}
																	</td>
																	<td className="px-4 py-3 text-gray-300">
																		{ticket.data_criacao ||
																		ticket.created_at
																			? new Date(
																					ticket.data_criacao ||
																						ticket.created_at
																			  ).toLocaleDateString(
																					'pt-BR'
																			  )
																			: 'N/A'}
																	</td>
																</tr>
															)
														)}
												</tbody>
											</table>
										</div>
										{reportData.length > 100 && (
											<div className="px-4 py-3 bg-gray-800/30 border-t border-gray-600/30 text-center text-gray-400 text-sm">
												Mostrando 100 de{' '}
												{reportData.length} registros.
												Use os botões de download para
												ver todos.
											</div>
										)}
									</div>
								</div>
							) : (
								// Chart view for other types
								<div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
									{/* Chart */}
									<div className="relative h-80 w-full lg:w-1/2">
										{/* Central number */}
										<div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
											<div className="text-3xl font-bold text-white mb-1">
												{totalCount}
											</div>
											<div className="text-xs text-gray-400 uppercase tracking-wide">
												{reportType === 'technician'
													? 'Técnicos'
													: 'Total'}
											</div>
										</div>

										<ResponsiveContainer
											width="100%"
											height="100%"
										>
											<PieChart>
												<defs>
													<filter id="glow">
														<feGaussianBlur
															stdDeviation="3"
															result="coloredBlur"
														/>
														<feMerge>
															<feMergeNode in="coloredBlur" />
															<feMergeNode in="SourceGraphic" />
														</feMerge>
													</filter>
												</defs>
												<Pie
													data={chartData}
													cx="50%"
													cy="50%"
													innerRadius={70}
													outerRadius={120}
													paddingAngle={3}
													dataKey="value"
													stroke="none"
													filter="url(#glow)"
												>
													{chartData.map(
														(entry, index) => (
															<Cell
																key={`cell-${index}`}
																fill={
																	entry.color
																}
																style={{
																	filter: `drop-shadow(0px 0px 8px ${entry.color}40)`,
																	transition:
																		'all 0.3s ease',
																}}
															/>
														)
													)}
												</Pie>
											</PieChart>
										</ResponsiveContainer>
									</div>

									{/* Legend */}
									<div className="flex flex-col gap-4 w-full lg:w-1/2 max-h-80 overflow-y-auto">
										{chartData.map((item, index) => (
											<div
												key={index}
												className="group relative bg-gradient-to-r from-gray-700/20 to-gray-600/20 rounded-2xl p-4 hover:from-gray-600/30 hover:to-gray-500/30 transition-all duration-300 border border-gray-600/20 hover:border-gray-500/40"
											>
												{/* Glow hover */}
												<div
													className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
													style={{
														background: `linear-gradient(135deg, ${item.color}20, transparent)`,
														boxShadow: `0 0 20px ${item.color}30`,
													}}
												></div>

												<div className="relative z-10 flex items-center gap-4">
													<div className="flex flex-col items-center">
														<div
															className="w-4 h-4 rounded-full shadow-lg mb-2 group-hover:scale-110 transition-transform duration-300"
															style={{
																backgroundColor:
																	item.color,
																boxShadow: `0 0 12px ${item.color}60`,
															}}
														></div>
														<div className="text-center">
															<div className="text-lg font-bold text-white mb-1">
																{item.value}
															</div>
															<div className="text-xs text-gray-400 uppercase tracking-wide">
																{
																	item.percentage
																}
																%
															</div>
														</div>
													</div>

													<div className="flex-1">
														<div className="text-white font-medium mb-2">
															{item.name}
														</div>
														{item.avgDuration && (
															<div className="text-xs text-gray-400 mb-2">
																Duração média:{' '}
																{
																	item.avgDuration
																}
															</div>
														)}
														<div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
															<div
																className="h-full rounded-full transition-all duration-500 ease-out"
																style={{
																	width: `${item.percentage}%`,
																	background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`,
																	boxShadow: `0 0 8px ${item.color}40`,
																}}
															></div>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)
						) : (
							<div className="flex items-center justify-center h-64">
								<div className="text-center">
									<Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
									<div className="text-gray-400 text-lg">
										Nenhum dado encontrado
									</div>
									<div className="text-gray-500 text-sm mt-2">
										Ajuste os filtros para visualizar dados
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{downloading && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-2xl p-6 flex items-center gap-4">
						<RefreshCw className="w-6 h-6 text-red-500 animate-spin" />
						<div className="text-white">Gerando relatório...</div>
					</div>
				</div>
			)}
		</div>
	);
}
