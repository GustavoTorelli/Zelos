'use client'
import { useEffect, useMemo, useState } from "react";
import { Funnel, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import NewUserModal from "../Modals/Admin/Users/NewUserModal";
import SeeUsersModal from "../Modals/Admin/Users/SeeUsersModal";

export default function TabelaDeUsuarios({ onEditUser, onViewUser }) {
    // filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusUserFilter, setStatusUserFilter] = useState('all');

    // modais
    const [isOpenNewUser, setIsOpenNewUser] = useState(false);
    const [isOpenSeeUsers, setIsOpenSeeUsers] = useState(false);

    // role do usuário atual
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    // estados de carregamento
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Headers de autenticação
    const authHeaders = useMemo(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const isJwt = token && token.includes('.')
        return isJwt ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    // role do usuário atual
    useEffect(() => {
        async function loadRole() {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                const payload = await res.json();
                if (res.ok) setCurrentUserRole(payload?.data?.role || '');
            } catch (_) {
                console.error('Erro ao carregar role do usuário');
            }
        }
        loadRole();
    }, []);

    // busca usuários da API
    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/users', { headers: authHeaders, credentials: 'include' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Erro ao carregar usuários');

                // garante que é array
                if (Array.isArray(data)) {
                    setUsers(data);
                } else if (Array.isArray(data.data)) {
                    setUsers(data.data);
                } else if (Array.isArray(data.users)) {
                    setUsers(data.users);
                } else {
                    setUsers([]);
                    setError('Formato de dados inesperado');
                }

            } catch (err) {
                console.error(err);
                setError(err.message || 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [authHeaders]);

    // limpar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setStatusUserFilter('all');
    };

    const hasActiveFilters = searchTerm || roleFilter || statusUserFilter !== 'all';

    // aplica filtros
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = searchTerm === '' ||
                user.id.toString().includes(searchTerm) ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === '' || user.role === roleFilter;

            const matchesStatus = statusUserFilter === 'all' ||
                (statusUserFilter === 'active' && user.status === 'Ativo') ||
                (statusUserFilter === 'inactive' && user.status === 'Inativo');

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusUserFilter]);

    // colunas
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
                            onClick={() => {
                                setSelectedUser(item);
                                setIsOpenSeeUsers(true);
                            }}
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

    if (loading) return (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4 flex items-center justify-center">
            <div className="text-zinc-400">Carregando usuários...</div>
        </div>
    );

    if (error) return (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4 flex items-center justify-center">
            <div className="text-red-400">Erro ao carregar usuários: {error}</div>
        </div>
    );

    return (
        <section>
            <NewUserModal isOpen={isOpenNewUser} onClose={() => setIsOpenNewUser(false)} />
            <SeeUsersModal
                isOpen={isOpenSeeUsers}
                onClose={() => setIsOpenSeeUsers(false)}
                userData={selectedUser}
            />

            {/* Filtros */}
            <div className="mb-8">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <div className="w-5 h-5 text-red-500"><Funnel size={20} /></div>
                            Filtros De Usuário
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Busca */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <div className="h-5 w-5 text-gray-400"><Search size={20} /></div>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar usuário (ID, nome, email)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            />
                        </div>

                        {/* Filtro por perfil */}
                        <div className="relative">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full appearance-none bg-gray-700/50 border border-gray-600/50 text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            >
                                <option value="">Todos os perfis</option>
                                <option value="admin">Administrador</option>
                                <option value="user">Usuário</option>
                                <option value="technician">Técnico</option>
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
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
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
                {filteredUsers.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-zinc-400 text-lg mb-2">Nenhum usuário encontrado</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200"
                                >
                                    Limpar filtros para ver todos os usuários
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <Table
                        isVirtualized
                        aria-label="Tabela de usuários"
                        removeWrapper
                        className="w-full h-full bg-transparent"
                        classNames={{
                            base: "w-auto bg-transparent",
                            table: "bg-transparent",
                            thead: "sticky top-0 z-10 bg-transparent",
                            th: "bg-transparent text-zinc-700 dark:text-zinc-300 font-semibold text-sm border-b border-zinc-200 dark:border-zinc-700 overflow-hidden",
                            td: "text-sm border-b border-zinc-100 dark:border-zinc-800 overflow-hidden",
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
                        <TableBody items={filteredUsers}>
                            {(item) => (
                                <TableRow key={item.id} className="h-10 max-h-10 bg-transparent">
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
