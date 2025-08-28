'use client'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { Funnel, Search, Trash2 } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";

export default function TabelaDeTickets({ onViewTicket }) {
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [patrimonies, setPatrimonies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState('');
    const [role, setRole] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusUserFilter, setStatusUserFilter] = useState('all');
    const [userId, setUserId] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);

    // token
    const authHeaders = useMemo(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const isJwt = token && token.includes('.');
        return isJwt ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    const handleApiError = useCallback((error, operation) => {
        console.error(`Error in ${operation}:`, error);
        if (error?.message?.includes('401') || error?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = '/';
            return;
        }
        setError(`Erro ao ${operation}: ${error.message}`);
    }, []);

    // Função para deletar ticket
    const handleDeleteTicket = useCallback(async (ticketId) => {

        setDeleteLoading(ticketId);
        setError("");

        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'DELETE',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            // Remove o user da lista local
            setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));


            setTimeout(() => {
                if (document.body.contains(successMessage)) {
                    document.body.removeChild(successMessage);
                }
            }, 3000);

        } catch (error) {
            handleApiError(error, 'excluir ticket');
        } finally {
            setDeleteLoading(null);
        }
    }, [authHeaders, handleApiError]);

    useEffect(() => {
        let isMounted = true; // Fix: Prevent memory leaks

        async function loadInitialData() {
            setLoading(true);
            setError("");

            try {
                // Load user role
                const roleRes = await fetch('/api/auth/me', {
                    headers: { ...authHeaders },
                    credentials: 'include'
                });

                if (roleRes.ok) {
                    const rolePayload = await roleRes.json();
                    if (isMounted) {
                        const userData = rolePayload?.data || rolePayload;
                        setRole(userData?.role || '');
                        setUserId(userData?.id || ''); // <-- pega o userId do usuário logado
                    }
                }

                // Load tickets
                const ticketQuery = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
                const ticketsRes = await fetch(`/api/tickets${ticketQuery}`, {
                    headers: { ...authHeaders },
                    credentials: 'include'
                });

                if (!ticketsRes.ok) {
                    throw new Error(`HTTP ${ticketsRes.status}`);
                }

                const ticketsPayload = await ticketsRes.json();
                if (isMounted) {
                    // Fix: Better data structure handling
                    const ticketsData = ticketsPayload?.data || ticketsPayload || [];
                    setTickets(Array.isArray(ticketsData) ? ticketsData : []);
                }

                // Load categories
                const categoriesRes = await fetch('/api/categories', {
                    headers: { ...authHeaders },
                    credentials: 'include'
                });

                if (categoriesRes.ok) {
                    const categoriesPayload = await categoriesRes.json();
                    if (isMounted) {
                        const categoriesData = categoriesPayload?.data || categoriesPayload || [];
                        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
                    }
                }

                // Load patrimonies
                const patrimoniesRes = await fetch('/api/patrimonies', {
                    headers: { ...authHeaders },
                    credentials: 'include'
                });

                if (patrimoniesRes.ok) {
                    const patrimoniesPayload = await patrimoniesRes.json();
                    if (isMounted) {
                        const patrimoniesData = patrimoniesPayload?.data || patrimoniesPayload || [];
                        setPatrimonies(Array.isArray(patrimoniesData) ? patrimoniesData : []);
                    }
                }

            } catch (e) {
                if (isMounted) {
                    handleApiError(e, 'carregar dados');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadInitialData();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [authHeaders, statusFilter, handleApiError]);

    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setStatusUserFilter('all');
        setStatusFilter('');
    };

    const hasActiveFilters = searchTerm || categoryFilter || statusUserFilter !== 'all' || statusFilter;

    // Create lookup maps for efficient data retrieval
    const categoryMap = useMemo(() => {
        const map = {};
        categories.forEach(cat => {
            if (cat && cat.id) {
                map[cat.id] = cat.title || cat.name || 'N/A';
            }
        });
        return map;
    }, [categories]);

    const patrimonyMap = useMemo(() => {
        const map = {};
        patrimonies.forEach(pat => {
            if (pat && (pat.code || pat.id)) {
                // Fix: Handle both code and id fields
                const key = pat.code || pat.id;
                map[key] = pat;
            }
        });
        return map;
    }, [patrimonies]);

    const enrichedTickets = useMemo(() => {
        return tickets.map(ticket => {
            const patrimonyKey = ticket.patrimony_code || ticket.patrimony_id;

            return {
                ...ticket,
                key: ticket.id?.toString() || Math.random().toString(),
                categoryName: categoryMap[ticket.category_id] || 'N/A',
                patrimonyInfo: patrimonyKey ? patrimonyMap[patrimonyKey] : null,
                // Normalize patrimony field
                patrimony_code: patrimonyKey
            };
        });
    }, [tickets, categoryMap, patrimonyMap]);

    // Status mapping from API to display
    const statusDisplayMap = {
        'pending': 'Pendente',
        'in_progress': 'Em Andamento',
        'completed': 'Concluído',
        'cancelled': 'Cancelado'
    };

    const columns = [
        { key: "id", label: "ID" },
        { key: "title", label: "Título" },
        { key: "categoryName", label: "Categoria" },
        { key: "patrimony_code", label: "Patrimônio" },
        { key: "status", label: "Status" },
        { key: "created_at", label: "Criado em" },
        { key: "actions", label: "Ações" },
    ];

    // Function to render table cells
    const renderCell = (item, columnKey) => {
        switch (columnKey) {
            case "id":
                return (
                    <div className="flex justify-center">
                        <span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">
                            #{item.id}
                        </span>
                    </div>
                );
            case "patrimony_code":
                return (
                    <div className="flex justify-center">
                        {item.patrimony_code ? (
                            <div className="text-center">
                                <span className="font-mono text-sm bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded block">
                                    #{item.patrimony_code}
                                </span>
                                {item.patrimonyInfo && (
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                                        {item.patrimonyInfo.name}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-zinc-400 dark:text-zinc-500 italic text-sm">N/A</span>
                        )}
                    </div>
                );
            case "status":
                const displayStatus = statusDisplayMap[item.status] || item.status;
                const statusStyles = {
                    "Pendente": "bg-red-500/20 border border-red-500 text-white w-30",
                    "Em Andamento": "bg-orange-500/20 border border-orange-500 text-white w-30",
                    "Concluído": "bg-green-500/20 border border-green-500 text-white w-30",
                };
                return (
                    <div className="flex justify-center items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-center ${statusStyles[displayStatus] || "bg-gray-500/20 border border-gray-500 text-gray-300"}`}>
                            {displayStatus}
                        </span>
                    </div>
                );
            case "title":
                return (
                    <div className="text-center flex items-center justify-center">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm max-w-[200px] truncate" title={item.title}>
                            {item.title || 'Sem título'}
                        </p>
                    </div>
                );
            case "categoryName":
                return (
                    <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">
                            {item.categoryName}
                        </span>
                    </div>
                );
            case "created_at":
                // Fix: Better date handling
                if (!item.created_at) return <span className="text-zinc-400">N/A</span>;

                try {
                    const date = new Date(item.created_at);
                    if (isNaN(date.getTime())) return <span className="text-zinc-400">Data inválida</span>;

                    const formattedDate = date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    const formattedTime = date.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    return (
                        <div className="text-center">
                            <div className="text-sm text-zinc-900 dark:text-zinc-100">{formattedDate}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{formattedTime}</div>
                        </div>
                    );
                } catch {
                    return <span className="text-zinc-400">Data inválida</span>;
                }
            case "actions":
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => onViewTicket && onViewTicket(item)}
                            className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                            Visualizar
                        </button>
                        {(role === 'admin' || role === 'technician') && (
                            <button
                                onClick={() => handleDeleteTicket(item.id)}
                                disabled={deleteLoading === item.id}
                                className="cursor-pointer bg-zinc-700/50 hover:bg-zinc-600/50 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                            >
                                Excluir
                            </button>
                        )}
                    </div>
                );
            default:
                return item[columnKey] || 'N/A';
        }
    };

    // Filter data based on applied filters
    const filteredData = useMemo(() => {
        return enrichedTickets.filter(item => {
            const matchesSearch = !searchTerm ||
                item.patrimony_code?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.patrimonyInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = !categoryFilter || item.category_id?.toString() === categoryFilter;

            // Filtro por role e status
            let matchesRoleStatus = false;

            if (role === 'admin') {
                // Admin vê todos
                matchesRoleStatus =
                    statusUserFilter === 'all' ||
                    ['pending', 'in_progress', 'completed', 'cancelled'].includes(item.status);
            } else if (role === 'technician') {
                // Technician vê todos pendentes, e seus próprios tickets em andamento/concluídos
                if (item.status === 'pending') {
                    matchesRoleStatus = true;
                } else if ((item.status === 'in_progress' || item.status === 'completed') &&
                    String(item.assigned_to) === String(userId)) {
                    matchesRoleStatus = true;
                }
            } else {
                // Usuário comum
                matchesRoleStatus =
                    statusUserFilter === 'all' ||
                    statusUserFilter === item.status;
            }

            return matchesSearch && matchesCategory && matchesRoleStatus;
        });
    }, [enrichedTickets, searchTerm, categoryFilter, statusUserFilter, role, userId]);


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <section>
            {/* Filters */}
            <div className="mb-8">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Funnel size={20} className="text-red-500" />
                            Filtros
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Search by patrimony ID, title, or patrimony name */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por patrimônio, título ou nome"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            />
                        </div>

                        {/* Filter by category */}
                        <div className="relative">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full appearance-none bg-gray-700/50 border border-gray-600/50 text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            >
                                <option value="">Todas as categorias</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id?.toString()}>
                                        {category.title || category.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Filter by status */}
                        <div className="relative">
                            <select
                                value={statusUserFilter}
                                onChange={(e) => setStatusUserFilter(e.target.value)}
                                className="w-full appearance-none bg-gray-700/50 border border-gray-600/50 text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            >
                                <option value="all">Todos os status</option>
                                <option value="pending">Pendentes</option>
                                <option value="in_progress">Em andamento</option>
                                <option value="completed">Concluídos</option>
                                <option value="cancelled">Cancelados</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4">
                {error ? (
                    <div className="flex justify-center items-center min-h-[300px] text-red-400">
                        <div className="text-center">
                            <p className="mb-2">Erro: {error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition-colors"
                            >
                                Recarregar
                            </button>
                        </div>
                    </div>
                ) : (
                    <Table
                        aria-label="Tabela de tickets/chamados"
                        removeWrapper
                        className="w-full h-full bg-transparent"
                        classNames={{
                            base: "w-full bg-transparent",
                            table: "bg-transparent",
                            thead: "sticky top-0 z-10 bg-transparent",
                            th: "bg-transparent text-zinc-700 dark:text-zinc-300 font-semibold text-sm border-b border-zinc-200 dark:border-zinc-700",
                            td: "text-sm border-b border-zinc-100 dark:border-zinc-800",
                            tbody: "bg-transparent",
                            tr: "bg-transparent hover:bg-zinc-50/30 dark:hover:bg-zinc-700/30 transition-colors duration-300"
                        }}
                    >
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn
                                    key={column.key}
                                    className="text-center font-semibold text-zinc-700 dark:text-zinc-300 py-3 bg-transparent"
                                >
                                    {column.label}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody
                            items={filteredData}
                            emptyContent={
                                <div className="text-center py-8 text-zinc-400">
                                    {hasActiveFilters ? "Nenhum ticket encontrado com os filtros aplicados" : "Nenhum ticket encontrado"}
                                </div>
                            }
                        >
                            {(item) => (
                                <TableRow key={item.key} className="bg-transparent">
                                    {(columnKey) => (
                                        <TableCell className="py-3 px-4 bg-transparent">
                                            {renderCell(item, columnKey)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </section>
    );
}