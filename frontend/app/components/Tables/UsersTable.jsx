'use client'

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

export default function TabelaDeUsuarios({ loading, error }) {
    // Linha de exemplo fixa
    const rowsToRender = [
        {
            key: "1",
            id: 1,
            title: "Problema no equipamento",
            category: "Hardware",
            patrimony_id: 123,
            status: "Pendente"
        },




    ];

    const columns = [
        { key: "id", label: "ID" },
        { key: "title", label: "Título" },
        { key: "category", label: "Categoria" },
        { key: "patrimony_id", label: "Patrimônio" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Ações" },
    ];

    const renderCell = (item, columnKey) => {
        switch (columnKey) {
            case "id":
                return <div className="flex justify-center"><span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">#{item.id}</span></div>;
            case "patrimony_id":
                return <div className="flex justify-center">{item.patrimony_id ? <span className="font-mono text-sm bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">#{item.patrimony_id}</span> : <span className="text-zinc-400 dark:text-zinc-500 italic text-sm">N/A</span>}</div>;
            case "status":
                const statusStyles = {
                    "Pendente": "bg-red-500/20 border border-red-500 text-white w-30 flex items-center justify-center ",
                    "Em Andamento": "bg-orange-500/20 border border-orange-500 text-white w-30 flex items-center justify-center",
                    "Concluído": "bg-green-500/20 border border-green-500 text-white w-30 flex items-center justify-center"
                };
                return <div className="flex justify-center items-center text-center"><span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[item.status] || ""}`}>{item.status}</span></div>;
            case "title":
                return <div className="text-center flex items-center justify-center"><p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm  w-50 " title={item.title}>{item.title}</p></div>;
            case "category":
                return <div className="flex justify-center"><span className="inline-flex items-center w-20 justify-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">{item.category}</span></div>;
            case "actions":
                return <div className="flex justify-center"><button className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200">Visualizar</button></div>;
            default:
                return item[columnKey];
        }
    };

    return (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4">
            {!error && (
                <Table
                    isVirtualized
                    aria-label="Tabela de tickets/chamados"
                    removeWrapper
                    className="w-full h-full bg-transparent"
                    classNames={{
                        base: "w-auto  bg-transparent",
                        table: "bg-transparent",
                        thead: "sticky top-0 z-10 bg-transparent",
                        th: "bg-transparent text-zinc-700 dark:text-zinc-300 font-semibold text-sm border-b border-zinc-200 dark:border-zinc-700  overflow-hidden ",
                        td: " text-sm border-b border-zinc-100 dark:border-zinc-800 overflow-hidden  ",
                        tbody: "bg-transparent",
                       tr: "bg-transparent hover:bg-zinc-50/30 dark:hover:bg-zinc-700/30 transition-colors duration-300 "
                    }}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn
                                key={column.key}
                                className="text-center font-semibold text-zinc-700 dark:text-zinc-300 py-3 h-10 max-h-10 overflow-hidden bg-transparent"
                                minWidth={120}
                            >
                                {column.label}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={rowsToRender}>
                        {(item) => (
                            <TableRow key={item.key} className="h-10 max-h-10 bg-transparent">
                                {(columnKey) => (
                                    <TableCell className="py-2 px-4 h-15 gap-1 overflow-hidden bg-transparent">{renderCell(item, columnKey)}</TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}