'use client'
import { useMemo, useState } from "react";
import { Funnel, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

export default function TabelaDePatrimonios({ loading, error, patrimonios = [], onEditPatrimonio }) {
    // filtros
    const [searchTerm, setSearchTerm] = useState('');

    // Função para limpar filtros
    const clearFilters = () => setSearchTerm('');

    //  filtros ativos
    const hasActiveFilters = searchTerm !== '';

    // Dados de exemplo caso não sejam fornecidos
    const defaultPatrimonios = [
        {
            key: "1",
            name: "Computador Dell 01",
            location: "B-01",
            code: "1230178",
            description: "Computador desktop Dell OptiPlex 3070"
        },
        {
            key: "2",
            name: "Notebook Lenovo",
            location: "A-15",
            code: "4578123",
            description: "Notebook Lenovo ThinkPad T14"
        },
        {
            key: "3",
            name: "Impressora HP",
            location: "C-05",
            code: "9856321",
            description: "Impressora HP LaserJet Pro M404dn"
        }
    ];

    // Usa os dados fornecidos ou os dados de exemplo
    const allPatrimonios = patrimonios.length > 0 ? patrimonios : defaultPatrimonios;

    // Aplica os filtros
    const filteredPatrimonios = useMemo(() => {
        return allPatrimonios.filter(item => {
            const matchesSearch =
                searchTerm === '' ||
                item.code.toString().includes(searchTerm) ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });
    }, [allPatrimonios, searchTerm]);

    // Colunas da tabela
    const columns = [
        { key: "code", label: "Código" },
        { key: "name", label: "Nome" },
        { key: "location", label: "Localização" },
        { key: "description", label: "Descrição" },
        { key: "actions", label: "Ações" },
    ];

    // renderização das células
    const renderCell = (item, columnKey) => {
        switch (columnKey) {
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
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm text-center">
                        {item.name}
                    </p>
                );
            case "location":
                return (
                    <div className="text-center flex items-center justify-center">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{item.location}</span>
                    </div>
                );
            case "description":
                return (
                    <div className="text-center flex items-center justify-center">
                        <p className="text-xs text-zinc-600 text-center w-full dark:text-zinc-400 truncate max-w-[250px] ">
                            {item.description}
                        </p>
                    </div>

                );
            case "actions":
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => onEditPatrimonio && onEditPatrimonio(item)}
                            className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                            Editar
                        </button>

                        <button

                            className="cursor-pointer bg-zinc-700/50 hover:bg-zinc-600/50 text-white  px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
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
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl min-h-[400px] p-4 flex items-center justify-center">
                <div className="text-zinc-400">Carregando patrimônios...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl min-h-[400px] p-4 flex items-center justify-center">
                <div className="text-red-400">Erro ao carregar patrimônios: {error}</div>
            </div>
        );
    }

    return (
        <section>
            {/* Filtros */}
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
                            placeholder="Buscar por código, nome, localização ou descrição"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700/50 border  border-gray-600/50 text-white placeholder-gray-400 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4">
                {filteredPatrimonios.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-zinc-400 text-lg">Nenhum patrimônio encontrado</p>
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
                                <TableRow key={item.key || item.code}>
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
