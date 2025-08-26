'use client'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { Funnel, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export default function TabelaDeTickets({ onViewTicket }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState('');
    const [role, setRole] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusUserFilter, setStatusUserFilter] = useState('all');

    // Estados não utilizados removidos: isOpen, isOpenSee

    const authHeaders = useMemo(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const isJwt = token && token.includes('.');
        return isJwt ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    useEffect(() => {
        async function loadRole() {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                const payload = await res.json();
                if (res.ok) setRole(payload?.data?.role || '');
            } catch (_) {
                // Silently fail - role loading is not critical
            }
        }

        async function loadTickets() {
            setLoading(true);
            try {
                const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
                const res = await fetch(`/api/tickets${qs}`, {
                    headers: { ...authHeaders },
                    credentials: 'include'
                });

            

                const payload = await res.json();
                setTickets(payload?.data || []);
            } catch (e) {
                setError(e.message);
                if (e?.message?.includes('401') || e?.code === 401) {
                    window.location.href = '/';
                }
            } finally {
                setLoading(false);
            }
        }

        loadRole();
        loadTickets();
    }, [authHeaders, statusFilter]);

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setStatusUserFilter('all');
        setStatusFilter('');
    };

    const hasActiveFilters = searchTerm || roleFilter || statusUserFilter !== 'all' || statusFilter;

    // Dados de teste melhorados
    const rowsToRender = useMemo(() => [
        {
            key: "1",
            id: 1,
            title: "Problema no equipamento de impressão",
            category: "Hardware",
            patrimony_id: 12345,
            status: "Pendente"
        },
        {
            key: "2",
            id: 2,
            title: "Sistema lento para acessar aplicação",
            category: "Software",
            patrimony_id: 12346,
            status: "Em Andamento"
        },
        {
            key: "3",
            id: 3,
            title: "Conexão de rede instável",
            category: "Rede",
            patrimony_id: 12347,
            status: "Concluído"
        },
        {
            key: "4",
            id: 4,
            title: "Monitor com defeito na tela",
            category: "Hardware",
            patrimony_id: null,
            status: "Pendente"
        },
        {
            key: "5",
            id: 5,
            title: "Atualização do sistema operacional",
            category: "Software",
            patrimony_id: 12349,
            status: "Em Andamento"
        }
    ], []);

    const columns = [
        { key: "id", label: "ID" },
        { key: "title", label: "Título" },
        { key: "category", label: "Categoria" },
        { key: "patrimony_id", label: "Patrimônio" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Ações" },
    ];

    // Função para renderizar células da tabela
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
            case "patrimony_id":
                return (
                    <div className="flex justify-center">
                        {item.patrimony_id ? (
                            <span className="font-mono text-sm bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">
                                #{item.patrimony_id}
                            </span>
                        ) : (
                            <span className="text-zinc-400 dark:text-zinc-500 italic text-sm">N/A</span>
                        )}
                    </div>
                );
            case "status":
                const statusStyles = {
                    "Pendente": "bg-red-500/20 border border-red-500 text-white w-30 text-center",
                    "Em Andamento": "bg-orange-500/20 border border-orange-500 text-white w-30 text-center ",
                    "Concluído": "bg-green-500/20 border border-green-500 text-white w-30 text-center"
                };
                return (
                    <div className="flex justify-center items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[item.status] || ""}`}>
                            {item.status}
                        </span>
                    </div>
                );
            case "title":
                return (
                    <div className="text-center flex items-center justify-center">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm max-w-[200px] truncate" title={item.title}>
                            {item.title}
                        </p>
                    </div>
                );
            case "category":
                return (
                    <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">
                            {item.category}
                        </span>
                    </div>
                );
            case "actions":
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => onViewTicket && onViewTicket(item)}
                            className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                            Visualizar
                        </button>
                        <button
                            onClick={() => console.log('Excluir ticket:', item.id)}
                            className="bg-zinc-700/50 hover:bg-zinc-600/50 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                            Excluir
                        </button>
                    </div>
                );
            default:
                return item[columnKey];
        }
    };

    // Filtrar dados baseado nos filtros aplicados
    const filteredData = useMemo(() => {
        return rowsToRender.filter(item => {
            const matchesSearch = !searchTerm ||
                item.patrimony_id?.toString().includes(searchTerm) ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = !roleFilter || item.category === roleFilter;

            const matchesStatus = statusUserFilter === 'all' ||
                (statusUserFilter === 'active' && item.status === 'Pendente') ||
                (statusUserFilter === 'in_progress' && item.status === 'Em Andamento') ||
                (statusUserFilter === 'completed' && item.status === 'Concluído');

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [rowsToRender, searchTerm, roleFilter, statusUserFilter]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <section>
            {/* Filtros */}
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
                        {/* Busca por ID do patrimônio ou título */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por patrimônio ou título"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            />
                        </div>

                        {/* Filtro por categoria */}
                        <div className="relative">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full appearance-none bg-gray-700/50 border border-gray-600/50 text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            >
                                <option value="">Todas as categorias</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Software">Software</option>
                                <option value="Rede">Rede</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Filtro por status */}
                        <div className="relative">
                            <select
                                value={statusUserFilter}
                                onChange={(e) => setStatusUserFilter(e.target.value)}
                                className="w-full appearance-none bg-gray-700/50 border border-gray-600/50 text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            >
                                <option value="all">Todos os status</option>
                                <option value="active">Pendentes</option>
                                <option value="in_progress">Em andamento</option>
                                <option value="completed">Concluídos</option>
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

            {/* Tabela */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4">
                {error ? (
                    <div className="flex justify-center items-center min-h-[300px] text-red-400">
                        <p>Erro: {error}</p>
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