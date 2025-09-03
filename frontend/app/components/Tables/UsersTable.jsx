'use client'
import { useEffect, useMemo, useState, useCallback } from "react";
import { Funnel, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import NewUserModal from "../Modals/Admin/Users/NewUserModal";
import SeeUsersModal from "../Modals/Admin/Users/SeeUsersModal";

export default function TabelaDeUsuarios({ onEditUser, onViewUser }) {
    // filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

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
    const [toggleError, setToggleError] = useState(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

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

    // limpar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setStatusFilter('all');
    };

    const hasActiveFilters = searchTerm || roleFilter || statusFilter !== 'all';

    // busca usuários da API com filtros de status
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        setToggleError(null);
        try {
            let url = `${API_BASE}/users`;
            const params = new URLSearchParams();
            if (statusFilter === 'all') {
                params.set('include_inactive', 'true');
            } else if (statusFilter === 'active') {
                params.set('inactive', 'false');
            } else if (statusFilter === 'inactive') {
                params.set('inactive', 'true');
            }
            const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;

            const res = await fetch(finalUrl, { 
                headers: { ...authHeaders, 'Content-Type': 'application/json' }, 
                credentials: 'include' 
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro ao carregar usuários');

            // garante que é array
            const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : Array.isArray(data.users) ? data.users : [];
            setUsers(arr);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Erro desconhecido');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [authHeaders, API_BASE, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // centraliza checagem de status e considera is_active do backend
    const isActive = useCallback((user) => {
        if (!user) return true;
        if (Object.prototype.hasOwnProperty.call(user, 'is_active')) {
            return user.is_active === true;
        }
        if (Object.prototype.hasOwnProperty.call(user, 'active')) {
            return user.active === true;
        }
        if (Object.prototype.hasOwnProperty.call(user, 'inactive')) {
            return user.inactive !== true;
        }
        return true;
    }, []);

    // optimistic update: altera localmente antes da resposta, faz rollback se erro
    const handleToggleUser = useCallback(async (userId, currentIsActive) => {
        setToggleError(null);

        // optimistic update: inverte is_active/active/inactive localmente
        setUsers(prev => prev.map(u => {
            if (u.id !== userId) return u;
            return {
                ...u,
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
            const url = `${API_BASE}/users/${userId}/${endpoint}`;

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
            // exemplo de payload: { success: true, data: { ...usuarioAtualizado } }
            const updatedItem = respBody && (respBody.data || respBody);
            if (updatedItem && updatedItem.id) {
                setUsers(prev => prev.map(u => u.id === updatedItem.id ? { ...u, ...updatedItem } : u));
            }

        } catch (error) {
            console.error('Erro ao alternar status do usuário:', error);
            // rollback - volta ao estado anterior
            setUsers(prev => prev.map(u => {
                if (u.id !== userId) return u;
                return {
                    ...u,
                    is_active: currentIsActive,
                    active: currentIsActive,
                    inactive: !currentIsActive
                };
            }));
            setToggleError(`Erro ao ${currentIsActive ? 'desabilitar' : 'habilitar'} usuário. ${error.message || ''}`);
        }
    }, [API_BASE]);

    // aplica filtros
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = searchTerm === '' ||
                user.id.toString().includes(searchTerm) ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === '' || user.role === roleFilter;

            const userIsActive = isActive(user);
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && userIsActive) ||
                (statusFilter === 'inactive' && !userIsActive);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter, isActive]);

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
            case "status": {
                const itemIsActive = isActive(item);
                return (
                    <div className="flex justify-center">
                        <span className={`text-xs font-medium w-22 text-center px-2 py-1 rounded-full ${itemIsActive
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
                // Oculta botões para usuário com ID 1
                if (item.id === 1) {
                    return (
                        <div className="flex justify-center gap-2">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 px-3 py-1">
                                Ação Bloqueada
                            </span>
                        </div>
                    );
                }
                
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
                            onClick={() => handleToggleUser(item.id, itemIsActiveForActions)}
                            className="cursor-pointer px-3 py-1 w-20 rounded text-xs font-medium transition-colors duration-200 bg-zinc-700/50 hover:bg-zinc-600/50 text-white"
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

    if (loading) return (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
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
            <div className="mb-8 mt-8">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Funnel size={20} className="text-red-500" />
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Busca */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={20} className="text-gray-400" />
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
                                className="w-full appearance-none bg-gray-700/50 border border-gray-600/50 text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 cursor-pointer"
                            >
                                <option value="">Todos os perfis</option>
                                <option value="admin">Administrador</option>
                                <option value="user">Usuário</option>
                                <option value="technician">Técnico</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {/* Filtro por status */}
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

            {/* Tabela */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[300px] p-4">
                {toggleError && (
                    <p className="text-red-400 text-sm mb-2">{toggleError}</p>
                )}

                {filteredUsers.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-zinc-400 text-lg">
                            {hasActiveFilters
                                ? "Nenhum usuário encontrado com os filtros aplicados"
                                : "Nenhum usuário encontrado"}
                        </p>
                    </div>
                ) : (
                    <Table
                        aria-label="Tabela de usuários"
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
                        <TableBody items={filteredUsers}>
                            {(item) => (
                                <TableRow key={item.id ?? item.email}>
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