import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import StatusModal from "../Modals/AtribuirModal";
function generateTicketRows(count) {
    const categories = [
        { id: 1, title: "Hardware" },
        { id: 2, title: "Software" },
        { id: 3, title: "Rede" },
        { id: 4, title: "Impressora" },
        { id: 5, title: "Email" }
    ];

    const statuses = ["Pendente", "Em Andamento", "Concluído"];

    return Array.from({ length: count }, (_, index) => {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const finishedDate = randomStatus === "Concluído"
            ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
            : null;

        return {
            key: index.toString(),
            id: index + 1,
            title: `Problema no equipamento`,
            category: randomCategory.title,
            patrimony_id: Math.random() > 0.3 ? Math.floor(Math.random() * 1000) + 1 : null,
            status: randomStatus,
            created_at: createdDate.toLocaleDateString('pt-BR'),
            finished_at: finishedDate ? finishedDate.toLocaleDateString('pt-BR') : null
        };
    });
}

export default function TabelaDeTickets() {
    const rows = generateTicketRows(10);
    const columns = [
        { key: "id", label: "ID" },
        { key: "title", label: "Título" },
        { key: "category", label: "Categoria" },
        { key: "patrimony_id", label: "Patrimônio" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Ações" },
    ];

    const renderCell = (item, columnKey) => {
        const cellValue = item[columnKey];

        switch (columnKey) {
            case "id":
                return (
                    <div className="flex justify-center">
                        <span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">
                            #{cellValue}
                        </span>
                    </div>
                );
            case "patrimony_id":
                return (
                    <div className="flex justify-center">
                        {cellValue ? (
                            <span className="font-mono text-sm bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded">
                                #{cellValue}
                            </span>
                        ) : (
                            <span className="text-zinc-400 dark:text-zinc-500 italic text-sm">N/A</span>
                        )}
                    </div>
                );
            case "status":
                const statusStyles = {
                    "Pendente": "bg-red-500 text-white dark:bg-red-600  w-30 justify-center items-center flex ",
                    "Em Andamento": "bg-orange-500 text-white dark:bg-orange-600  w-30 justify-center items-center flex",
                    "Concluído": "bg-green-500 text-white dark:bg-green-600  w-30 justify-center items-center flex"
                };
                return (
                    <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[cellValue] || ""}`}>
                            {cellValue}
                        </span>
                    </div>
                );
            case "title":
                return (
                    <div className="text-center">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm truncate" title={cellValue}>
                            {cellValue}
                        </p>
                    </div>
                );
            case "category":
                return (
                    <div className="flex justify-center">
                        <span className="inline-flex items-center w-20 justify-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">
                            {cellValue}
                        </span>
                    </div>
                );
            case "actions":
                return (
                    <div className="flex justify-center">
                        <button className=" cursor-pointer bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-500 dark:hover:bg-zinc-400 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200">
                            Visualizar
                        </button>
                    </div>
                );
            default:
                return cellValue;
        }
    };

    return (
        <div className="w-full overflow-x-auto p-2 lg:p-4 h-auto">
            <div className="overflow-hidden rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                <Table
                    isVirtualized
                    aria-label="Tabela de tickets/chamados"
                    removeWrapper
                    className="w-full"
                    classNames={{
                        base: "max-h-[600px] overflow-auto",
                        table: "min-h-[400px]",
                        thead: "sticky top-0 z-10",
                        th: "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm border-b border-zinc-200 dark:border-zinc-700 px-4 py-3",
                        td: "py-3 px-4 text-sm border-b border-zinc-100 dark:border-zinc-800",
                        tbody: "",
                        tr: `
      odd:bg-zinc-50 even:bg-white 
      dark:odd:bg-zinc-700 dark:even:bg-zinc-800
      
      transition-colors duration-300
    `
                    }}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn
                                key={column.key}
                                className="text-center font-semibold text-zinc-700 dark:text-zinc-300 py-3"
                                minWidth={
                                    column.key === "id" ? 70 :
                                        column.key === "title" ? 200 :
                                            column.key === "category" ? 150 :
                                                column.key === "patrimony_id" ? 120 :
                                                    column.key === "status" ? 130 :
                                                        column.key === "actions" ? 120 : undefined
                                }
                            >
                                {column.label}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={rows}>
                        {(item) => (
                            <TableRow key={item.key} className="border-b border-zinc-100 dark:border-zinc-800">
                                {(columnKey) => (
                                    <TableCell className="py-3 px-4">
                                        {renderCell(item, columnKey)}
                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}