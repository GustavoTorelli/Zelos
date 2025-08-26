'use client'

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

export default function TabelaDeUsuarios({ loading, error, users = [], onEditUser, onViewUser }){
    // Dados de exemplo caso não sejam fornecidos
    const defaultUsers = [
        {
            key: "1",
            id: 1,
            name: "Richard",
            email: "richardrrggts@gmail.com",
            role: "admin",
            status: "Ativo"
        },
        {
            key: "2",
            id: 2,
            name: "Maria Silva",
            email: "maria.silva@empresa.com",
            role: "user",
            status: "Ativo"
        },
        {
            key: "3",
            id: 3,
            name: "João Santos",
            email: "joao.santos@empresa.com",
            role: "technician",
            status: "Inativo"
        }
    ];

    const rowsToRender = users.length > 0 ? users : defaultUsers;

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Nome" },
        { key: "email", label: "E-mail" },
        { key: "role", label: "Perfil" },
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
            case "name":
                return (
                    <div className="text-center flex items-center justify-center">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm" title={item.name}>
                            {item.name}
                        </p>
                    </div>
                );
            case "email":
                return (
                    <div className="text-center flex items-center justify-center">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm" title={item.email}>
                            {item.email}
                        </p>
                    </div>
                );
            case "role":
                const roleStyles = {
                    "admin": "bg-purple-500/20 border border-purple-500 text-white w-30 text-center",
                    "user": "bg-blue-500/20 border border-blue-500 text-white w-30 text-center",
                    "technician": "bg-green-500/20 border border-green-500 text-white w-30 text-center",
                };
                const roleLabels = {
                    "admin": "Administrador",
                    "user": "Usuário",
                    "technician": "Técnico",
                };
                return (
                    <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleStyles[item.role] || "bg-zinc-500/20 border border-zinc-500 text-zinc-300"}`}>
                            {roleLabels[item.role] || item.role}
                        </span>
                    </div>
                );
            case "status":
                const statusStyles = {
                    "Ativo": "bg-green-500/20 border border-green-500 text-white w-20 text-center",
                    "Inativo": "bg-red-500/20 border border-red-500 text-white w-20 text-center",
                };
                return (
                    <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[item.status] || "bg-zinc-500/20 border border-zinc-500 text-zinc-300"}`}>
                            {item.status || "Ativo"}
                        </span>
                    </div>
                );
            case "actions":
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => onViewUser(item)}
                            className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                            Editar
                        </button>
                    </div>
                );
            default:
                return item[columnKey];
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4 flex items-center justify-center">
                <div className="text-zinc-400">Carregando usuários...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4 flex items-center justify-center">
                <div className="text-red-400">Erro ao carregar usuários: {error}</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4">
            <Table
                isVirtualized
                aria-label="Tabela de usuários"
                removeWrapper
                className="w-full h-full bg-transparent"
                classNames={{
                    base: "w-auto  bg-transparent",
                    table: " bg-transparent",
                    thead: "sticky top-0 z-10 bg-transparent",
                    th: "bg-transparent text-zinc-700 dark:text-zinc-300 font-semibold text-sm border-b border-zinc-200 dark:border-zinc-700  overflow-hidden",
                    td: " text-sm border-b border-zinc-100 dark:border-zinc-800 overflow-hidden",
                    tbody: "bg-transparent",
                    tr: "bg-transparent hover:bg-zinc-50/30 dark:hover:bg-zinc-700/30 transition-colors duration-300"
                }}
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.key}
                            className="text-center font-semibold text-zinc-700 dark:text-zinc-300 py-3 h-10 max-h-10 overflow-hidden bg-transparent"
                            minWidth={column.key === "actions" ? 180 : 120}
                        >
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={rowsToRender}>
                    {(item) => (
                        <TableRow key={item.key || item.id} className="h-10 max-h-10 bg-transparent">
                            {(columnKey) => (
                                <TableCell className="py-2 px-4 h-15 gap-1 overflow-hidden bg-transparent">
                                    {renderCell(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}