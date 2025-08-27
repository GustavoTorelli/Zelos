'use client'

import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { Funnel, Search } from "lucide-react";

export default function TabelaDeCategorias({ loading, error, onEditCategoria }) {
    const [categorias, setCategorias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const clearFilters = () => setSearchTerm('');
    const hasActiveFilters = searchTerm !== '';

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await fetch('/api/categories');
                if (!res.ok) throw new Error('Falha ao carregar categorias');

                const data = await res.json();

                // Pega o array correto da API
                const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
                setCategorias(arr);
            } catch (err) {
                console.error(err);
                setCategorias([]);
            }
        };

        fetchCategorias();
    }, []);

    const filteredCategorias = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return categorias.filter(cat =>
            term === "" ||
            (cat.title && cat.title.toLowerCase().includes(term)) ||
            (cat.description && cat.description.toLowerCase().includes(term)) ||
            (cat.id && cat.id.toString().toLowerCase().includes(term))
        );
    }, [categorias, searchTerm]);

    const columns = [
        { key: "id", label: "ID" },
        { key: "title", label: "Título" },
        { key: "description", label: "Descrição" },
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
                return (
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm text-left">
                        {item.title}
                    </p>
                );
            case "description":
                return (
                    <div className="text-left flex items-center">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[350px] text-left">
                            {item.description}
                        </p>
                    </div>
                );
            case "actions":
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => onEditCategoria && onEditCategoria(item)}
                            className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                            Editar
                        </button>
                        <button
                            className="cursor-pointer bg-zinc-700/50 hover:bg-zinc-600/50 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                            Excluir
                        </button>
                    </div>
                );
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

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[300px] text-red-400">
                Erro ao carregar categorias: {error}
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
                </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[300px] p-4">
                {filteredCategorias.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-zinc-400 text-lg">
                            {hasActiveFilters ? "Nenhuma categoria encontrada com os filtros aplicados" : "Nenhuma categoria encontrada"}
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
                                <TableRow key={item.id || item.title}>
                                    {(columnKey) => (
                                        <TableCell className="py-2 px-4 h-15 gap-1 overflow-hidden bg-transparent">{renderCell(item, columnKey)}</TableCell>
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