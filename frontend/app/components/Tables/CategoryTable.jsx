'use client'

import { useEffect, useMemo, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { Funnel, Search } from "lucide-react";

export default function TabelaDeCategorias({ loading, error: externalError, onEditCategoria }) {
    const [categorias, setCategorias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [toggleError, setToggleError] = useState(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
    };
    const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all';

    const fetchCategorias = useCallback(async () => {
        try {
            setToggleError(null);
            let url = `${API_BASE}/categories`;
            const params = new URLSearchParams();
            if (statusFilter === 'all') {
                params.set('include_inactive', 'true');
            } else if (statusFilter === 'active') {
                params.set('inactive', 'false');
            } else if (statusFilter === 'inactive') {
                params.set('inactive', 'true');
            }
            const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;

            const res = await fetch(finalUrl, { headers: { 'Content-Type': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
            setCategorias(arr);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
            setCategorias([]);
        }
    }, [API_BASE, statusFilter]);

    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    // centraliza checagem de status e considera is_active do backend
    const isActive = useCallback((category) => {
        if (!category) return true;
        if (Object.prototype.hasOwnProperty.call(category, 'is_active')) {
            return category.is_active === true;
        }
        if (Object.prototype.hasOwnProperty.call(category, 'active')) {
            return category.active === true;
        }
        if (Object.prototype.hasOwnProperty.call(category, 'inactive')) {
            return category.inactive !== true;
        }
        return true;
    }, []);

    // optimistic update: altera localmente antes da resposta, faz rollback se erro
    const handleToggleCategory = useCallback(async (categoryId, currentIsActive) => {
        setToggleError(null);

        // otimistc update: inverte is_active/active/inactive localmente
        setCategorias(prev => prev.map(c => {
            if (c.id !== categoryId) return c;
            return {
                ...c,
                is_active: !currentIsActive,
                active: !currentIsActive,
                inactive: currentIsActive // se estava ativo, passa a inactive = true
            };
        }));

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const isJwt = token && token.includes('.');
            const authHeader = isJwt ? { Authorization: `Bearer ${token}` } : {};

            const endpoint = currentIsActive ? 'deactivate' : 'activate';
            const url = `${API_BASE}/categories/${categoryId}/${endpoint}`;

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                let errorData = {};
                try { errorData = await response.json(); } catch (e) { /* ignore */ }
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            // se a API retornar o item atualizado no body, atualizamos localmente com ele
            const respBody = await response.json().catch(() => null);
            // exemplo de payload: { success: true, data: { ...categoriaAtualizada } }
            const updatedItem = respBody && (respBody.data || respBody);
            if (updatedItem && updatedItem.id) {
                setCategorias(prev => prev.map(c => c.id === updatedItem.id ? { ...c, ...updatedItem } : c));
            }

        } catch (error) {
            console.error('Erro ao alternar status da categoria:', error);
            // rollback - volta ao estado anterior
            setCategorias(prev => prev.map(c => {
                if (c.id !== categoryId) return c;
                return {
                    ...c,
                    is_active: currentIsActive,
                    active: currentIsActive,
                    inactive: !currentIsActive
                };
            }));
            setToggleError(`Erro ao ${currentIsActive ? 'desabilitar' : 'habilitar'} categoria. ${error.message || ''}`);
        }
    }, [API_BASE]);

    const filteredCategorias = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return categorias.filter(cat => {
            const matchesSearch = term === "" ||
                (cat.title && cat.title.toLowerCase().includes(term)) ||
                (cat.description && cat.description.toLowerCase().includes(term)) ||
                (cat.id && cat.id.toString().toLowerCase().includes(term));
            const categoryIsActive = isActive(cat);
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && categoryIsActive) ||
                (statusFilter === 'inactive' && !categoryIsActive);
            return matchesSearch && matchesStatus;
        });
    }, [categorias, searchTerm, statusFilter, isActive]);

    const columns = [
        { key: "id", label: "ID" },
        { key: "title", label: "Título" },
        { key: "description", label: "Descrição" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Ações" },
    ];

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
            case "title":
                return <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm text-left">{item.title}</p>;
            case "description":
                return (
                    <div className="text-left flex items-center">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[350px] text-left">
                            {item.description}
                        </p>
                    </div>
                );
            case "status": {
                const itemIsActive = isActive(item);
                return (
                    <div className="flex justify-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${itemIsActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}>
                            {itemIsActive ? 'Habilitado' : 'Desabilitado'}
                        </span>
                    </div>
                );
            }
            case "actions": {
                const itemIsActiveForActions = isActive(item);
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => onEditCategoria && onEditCategoria(item)}
                            className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => handleToggleCategory(item.id, itemIsActiveForActions)}
                            className="cursor-pointer px-3 py-1 rounded text-xs font-medium transition-colors duration-200 bg-zinc-700/50 hover:bg-zinc-600/50 text-white"
                        >
                            {itemIsActiveForActions ? 'Desabilitar' : 'Habilitar'}
                        </button>
                    </div>
                );
            }
            default:
                return item[columnKey];
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (externalError) {
        return (
            <div className="flex justify-center items-center min-h-[300px] text-red-400">
                Erro ao carregar categorias: {externalError}
            </div>
        );
    }

    return (
        <section>
            <div className="mb-8 mt-8">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Funnel size={20} className="text-red-500" />
                            Filtros de Categoria
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={20} className="text-gray-400" />
                            </div>
                            <input
                                placeholder="Buscar categoria por ID, nome ou descrição"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 appearance-none cursor-pointer"
                            >
                                <option value="all">Todos os status</option>
                                <option value="active">Somente habilitados</option>
                                <option value="inactive">Somente desabilitados</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[300px] p-4">
                {toggleError && (
                    <p className="text-red-400 text-sm mb-2">{toggleError}</p>
                )}

                {filteredCategorias.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-zinc-400 text-lg">
                            {hasActiveFilters
                                ? "Nenhuma categoria encontrada com os filtros aplicados"
                                : "Nenhuma categoria encontrada"}
                        </p>
                    </div>
                ) : (
                    <Table
                        aria-label="Tabela de categorias"
                        removeWrapper
                        className="w-full h-full bg-transparent"
                        classNames={{
                            th: "bg-transparent text-zinc-700 dark:text-zinc-300 font-semibold text-sm border-b border-zinc-200 dark:border-zinc-700",
                            td: "text-sm border-b border-zinc-100 dark:border-zinc-800",
                            tr: "hover:bg-zinc-50/30 dark:hover:bg-zinc-700/30 transition-colors"
                        }}
                    >
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn
                                    key={column.key}
                                    className={`font-semibold text-zinc-700 dark:text-zinc-300 py-3 ${column.key === 'actions' ? 'text-center' :
                                        column.key === 'id' ? 'text-center' :
                                            'text-center'
                                        }`}
                                >
                                    {column.label}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody items={filteredCategorias}>
                            {(item) => (
                                <TableRow key={item.id ?? item.title}>
                                    {(columnKey) => (
                                        <TableCell className="py-2 px-4 h-15 gap-1 overflow-hidden bg-transparent">
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
