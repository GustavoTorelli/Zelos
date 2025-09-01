'use client'

import { useEffect, useMemo, useState, useCallback } from "react";
import { Funnel, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

export default function TabelaDePatrimonios({ loading, error, onEditPatrimonio }) {
    const [patrimonios, setPatrimonios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorState, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(null);
    const [role, setRole] = useState(null);

    const clearFilters = () => setSearchTerm('');
    const hasActiveFilters = searchTerm !== '';

    // Buscar role do usuário logado
    useEffect(() => {
        const getUserRole = () => {
            try {
                // Tenta pegar role diretamente do localStorage
                const storedRole = localStorage.getItem("role") || localStorage.getItem("userRole");

                if (storedRole) {
                    console.log("Role encontrada no localStorage:", storedRole);
                    setRole(storedRole);
                    return;
                }

                // Se não tem role salva, tenta extrair do token JWT
                const token = localStorage.getItem("token");

                if (token && token.includes(".")) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        console.log("Payload do JWT:", payload);

                        const userRole = payload.role || payload.user_role || payload.type;
                        console.log("Role extraída do token:", userRole);

                        if (userRole) {
                            setRole(userRole);
                            // Salva no localStorage para próximas vezes
                            localStorage.setItem("role", userRole);
                        }
                    } catch (jwtError) {
                        console.error("Erro ao decodificar JWT:", jwtError);
                        setRole(null);
                    }
                } else {
                    console.log("Nenhum token válido encontrado");
                    setRole(null);
                }

            } catch (err) {
                console.error("Erro ao buscar role:", err);
                setRole(null);
            }
        };

        getUserRole();
    }, []);

    // Buscar patrimônios
    useEffect(() => {
        const fetchPatrimonios = async () => {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const isJwt = token && token.includes(".");
                const authHeaders = isJwt ? { Authorization: `Bearer ${token}` } : {};

                const res = await fetch('/api/patrimonies', {
                    headers: { ...authHeaders },
                    credentials: 'include'
                });

                if (!res.ok) throw new Error('Falha ao carregar patrimônios');

                const data = await res.json();
                setPatrimonios(data?.data || []);
                setError('');
            } catch (err) {
                console.error(err);
                setPatrimonios([]);
                setError('Erro ao carregar patrimônios');
            }
        };

        fetchPatrimonios();
    }, []);

    const handleDeletePatrimony = useCallback(async (patrimony) => {
        const patrimonyCode = patrimony.code;

        if (!patrimonyCode) {
            setError("Código do patrimônio inválido.");
            return;
        }

        setError("");
        setIsDeleting(patrimonyCode);

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const isJwt = token && token.includes('.');
            const authHeaders = isJwt ? { Authorization: `Bearer ${token}` } : {};

            const response = await fetch(`/api/patrimonies/${patrimonyCode}`, {
                method: 'DELETE',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    console.warn('Não foi possível parsear resposta de erro:', parseError);
                }
                throw new Error(errorMessage);
            }

            setPatrimonios(prev => prev.filter(p => p.code !== patrimonyCode));
            console.log('Patrimônio excluído com sucesso:', patrimonyCode);
        } catch (error) {
            console.error('Erro ao excluir patrimônio:', error);

            let errorMessage = "Erro ao excluir patrimônio.";
            if (error.message.includes('401')) {
                errorMessage = "Não autorizado. Faça login novamente.";
            } else if (error.message.includes('403')) {
                errorMessage = "Sem permissão para excluir este patrimônio.";
            } else if (error.message.includes('404')) {
                errorMessage = "Patrimônio não encontrado.";
            } else if (error.message.includes('500')) {
                errorMessage = "Erro interno do servidor. Tente novamente.";
            } else if (error.message !== `HTTP ${error.message}`) {
                errorMessage = error.message;
            }

            setError(errorMessage);
        } finally {
            setIsDeleting(null);
        }
    }, []);

    const filteredPatrimonios = useMemo(() => {
        return Array.isArray(patrimonios)
            ? patrimonios.filter(item => {
                const term = searchTerm.toLowerCase();
                return term === '' ||
                    (item.id && item.id.toString().toLowerCase().includes(term)) ||
                    (item.code && item.code.toString().toLowerCase().includes(term)) ||
                    (item.name && item.name.toLowerCase().includes(term)) ||
                    (item.location && item.location.toLowerCase().includes(term)) ||
                    (item.description && item.description.toLowerCase().includes(term));
            })
            : [];
    }, [patrimonios, searchTerm]);

    const columns = useMemo(() => {
        const baseColumns = [
            { key: "id", label: "ID" },
            { key: "code", label: "Código" },
            { key: "name", label: "Nome" },
            { key: "location", label: "Localização" },
            { key: "description", label: "Descrição" },
        ];
        if (role !== "technician") {
            baseColumns.push({ key: "actions", label: "Ações" });
        }
        return baseColumns;
    }, [role]);

    const renderCell = (item, columnKey) => {
        switch (columnKey) {
            case "id":
                return (
                    <div className="flex justify-center items-start">
                        <span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">
                            #{item.id}
                        </span>
                    </div>
                );
            case "code":
                return (
                    <div className="flex justify-center">
                        <span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">
                            #{item.code}
                        </span>
                    </div>
                );
            case "name":
                return (
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm text-left">
                        {item.name}
                    </p>
                );
            case "location":
                return (
                    <div className="text-left flex items-center">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{item.location}</span>
                    </div>
                );
            case "description":
                return (
                    <div className="text-left flex items-center">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[250px]">
                            {item.description}
                        </p>
                    </div>
                );
            case "actions":
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => onEditPatrimonio && onEditPatrimonio(item)}
                            disabled={isDeleting === (item.code || item.id)}
                            className="cursor-pointer bg-red-700 hover:bg-red-800 disabled:bg-red-800/50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => handleDeletePatrimony(item)}
                            disabled={isDeleting === (item.code || item.id)}
                            className="cursor-pointer bg-zinc-700/50 hover:bg-zinc-600/50 disabled:bg-zinc-600/25 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                            {isDeleting === (item.code || item.id) ? 'Excluindo...' : 'Excluir'}
                        </button>
                    </div>
                );
            default:
                return item[columnKey];
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl min-h-[400px] p-4 flex items-center justify-center">
                <div className="text-zinc-400">Carregando patrimônios...</div>
            </div>
        );
    }

    if (error || errorState) {
        return (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl min-h-[400px] p-4 flex items-center justify-center">
                <div className="text-red-400">Erro ao carregar patrimônios: {error || errorState}</div>
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
                            Filtros de Patrimônio
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
                            type="text"
                            placeholder="Buscar por ID, código, nome, localização ou descrição"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4">
                {filteredPatrimonios.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-zinc-400 text-lg">
                            {hasActiveFilters ? "Nenhum patrimônio encontrado com os filtros aplicados" : "Nenhum patrimônio encontrado"}
                        </p>
                    </div>
                ) : (
                    <Table
                        aria-label="Tabela de patrimônios"
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
                                    className="text-center font-semibold text-zinc-700 dark:text-zinc-300 py-3"
                                    minWidth={column.key === "actions" ? 120 : 100}
                                >
                                    {column.label}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody items={filteredPatrimonios}>
                            {(item) => (
                                <TableRow key={`patrimonio-${item.id}`}>
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
