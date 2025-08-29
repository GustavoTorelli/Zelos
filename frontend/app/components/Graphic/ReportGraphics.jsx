import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Filter, Users, Tag, BarChart3, RefreshCw } from 'lucide-react';

export default function ReportGraphics() {
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [filters, setFilters] = useState({
        technicianId: '',
        categoryId: '',
        status: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Status mapping with colors and Portuguese labels
    const statusConfig = {
        pending: { label: 'Pendente', color: '#F59E0B' },
        in_progress: { label: 'Em Andamento', color: '#3B82F6' },
        completed: { label: 'Concluído', color: '#10B981' }
    };

    // Fetch initial data from Next.js API routes
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '';
                const headers = { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) };

                // Faz as três requisições em paralelo
                const [categoriesRes, usersRes, ticketsRes] = await Promise.all([
                    fetch('/api/categories', { headers }),
                    fetch('/api/users', { headers }),
                    fetch('/api/tickets', { headers })
                ]);

                if (!categoriesRes.ok || !usersRes.ok || !ticketsRes.ok) {
                    throw new Error('Erro ao carregar dados');
                }

                const categoriesData = await categoriesRes.json();
                const usersData = await usersRes.json();
                const ticketsData = await ticketsRes.json();

                // Ajusta arrays corretamente
                const categoriesArray = Array.isArray(categoriesData.categories) ? categoriesData.categories : Array.isArray(categoriesData) ? categoriesData : [];
                const usersArray = Array.isArray(usersData.users) ? usersData.users : Array.isArray(usersData) ? usersData : [];
                const ticketsArray = Array.isArray(ticketsData.tickets) ? ticketsData.tickets : Array.isArray(ticketsData) ? ticketsData : [];

                setCategories(categoriesArray);
                setTechnicians(usersArray.filter(u => u.role === 'technician'));
                setTickets(ticketsArray);

            } catch (err) {
                console.error('Erro no fetch inicial:', err);
                setError(err.message || 'Erro desconhecido');
                setCategories([]);
                setTechnicians([]);
                setTickets([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);


    // Fetch tickets with filters
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const token = typeof window !== 'undefined'
                    ? (localStorage.getItem('token') || sessionStorage.getItem('token') || '')
                    : '';

                const headers = {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                };

                const params = new URLSearchParams();
                if (filters.technicianId) params.append('technicianId', filters.technicianId);
                if (filters.categoryId) params.append('categoryId', filters.categoryId);
                if (filters.status) params.append('status', filters.status);

                const url = params.toString() ? `/api/tickets?${params.toString()}` : '/api/tickets';
                const response = await fetch(url, { headers });

                if (!response.ok) throw new Error(`Erro ao carregar tickets: ${response.status}`);

                const data = await response.json();
                const ticketsArray = Array.isArray(data.tickets) ? data.tickets : Array.isArray(data) ? data : [];
                setTickets(ticketsArray);
                setError(null);

            } catch (err) {
                console.error('Error fetching tickets:', err);
                setError('Erro ao carregar chamados');
                setTickets([]);
            }
        };

        fetchTickets();
    }, [filters]);

    // Set loading to false after initial data fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [loading]);

    // Calculate pie chart data based on status distribution
    const getPieData = () => {
        const statusCounts = {};

        // Initialize all statuses with 0
        Object.keys(statusConfig).forEach(status => {
            statusCounts[status] = 0;
        });

        // Count tickets by status
        tickets.forEach(ticket => {
            if (ticket.status && statusCounts.hasOwnProperty(ticket.status)) {
                statusCounts[ticket.status]++;
            }
        });

        const totalTickets = tickets.length;

        // Convert to pie chart format, excluding statuses with 0 count
        return Object.entries(statusCounts)
            .filter(([_, count]) => count > 0)
            .map(([status, count]) => ({
                name: statusConfig[status].label,
                value: count,
                color: statusConfig[status].color,
                percentage: totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0
            }));
    };

    const pieData = getPieData();
    const totalTickets = tickets.length;

    // Refresh data function
    const refreshData = async () => {
        setLoading(true);
        setFilters({ technicianId: '', categoryId: '', status: '' });

        // Re-fetch all data
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    if (loading) {
        return (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl p-6">
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="w-8 h-8 text-red-800 animate-spin" />
                        <div className="text-white text-lg">Carregando dados...</div>
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
                        <div className="text-red-400 text-lg mb-2">Erro ao carregar dados</div>
                        <div className="text-gray-400 text-sm mb-4">{error}</div>
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
                                <h3 className="text-xl font-bold text-white mb-1">Status dos Chamados</h3>
                                <p className="text-gray-400 text-sm">Distribuição por status</p>
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

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="relative">
                            <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <select
                                value={filters.technicianId}
                                onChange={(e) => setFilters(prev => ({ ...prev, technicianId: e.target.value }))}
                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25"
                            >
                                <option value="">Todos os técnicos</option>
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <select
                                value={filters.categoryId}
                                onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25"
                            >
                                <option value="">Todas as categorias</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25"
                            >
                                <option value="">Todos os status</option>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Chart Content */}
                    {totalTickets > 0 ? (
                        <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
                            {/* Pie Chart */}
                            <div className="relative h-80 w-full lg:w-1/2">
                                {/* Central number */}
                                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
                                    <div className="text-3xl font-bold text-white mb-1">{totalTickets}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wide">Chamados</div>
                                </div>

                                {/* Chart */}
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            <filter id="glow">
                                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={120}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                            filter="url(#glow)"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    style={{
                                                        filter: `drop-shadow(0px 0px 8px ${entry.color}40)`,
                                                        transition: "all 0.3s ease",
                                                    }}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-col gap-4 w-full lg:w-1/2">
                                {pieData.map((item, index) => (
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
                                                        backgroundColor: item.color,
                                                        boxShadow: `0 0 12px ${item.color}60`,
                                                    }}
                                                ></div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-white mb-1">{item.value}</div>
                                                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                                                        {item.percentage}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="text-white font-medium mb-2">{item.name}</div>
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
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <div className="text-gray-400 text-lg">Nenhum chamado encontrado</div>
                                <div className="text-gray-500 text-sm mt-2">Ajuste os filtros para visualizar dados</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}