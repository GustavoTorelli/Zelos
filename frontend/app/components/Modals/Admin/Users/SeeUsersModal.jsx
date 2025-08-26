'use client';
import { useState } from "react";
import { Users, X } from "lucide-react";

export default function SeeUsersModal({ isOpen, onClose, userData = {} }) {
    if (!isOpen) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userData?.name || "");
    const [email, setEmail] = useState(userData?.email || "");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(userData?.role || "");
    const [status, setStatus] = useState(userData?.status || "Ativo");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!name.trim()) throw new Error("Nome é obrigatório");
            if (!email.trim()) throw new Error("Email é obrigatório");
            if (!role.trim()) throw new Error("Perfil é obrigatório");

            // Validação básica de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) throw new Error("Email inválido");

            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers = token && token.includes('.') ?
                { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } :
                { 'Content-Type': 'application/json' };

            const body = {
                name,
                email,
                role,
                status
            };

            // Só inclui senha se foi preenchida
            if (password.trim()) {
                body.password = password;
            }

            const res = await fetch(`/api/users/${userData.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.message || 'Falha ao atualizar usuário');
            }

            setSuccess("Usuário atualizado com sucesso!");
            setPassword("");
            setIsEditing(false);
            setTimeout(() => {
                setSuccess("");
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        const newStatus = status === "Ativo" ? "Inativo" : "Ativo";
        setStatus(newStatus);

        // Aqui você pode fazer uma chamada à API para atualizar apenas o status
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers = token && token.includes('.') ?
                { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } :
                { 'Content-Type': 'application/json' };

            await fetch(`/api/users/${userData.id}/status`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            setStatus(status); // Reverte se houver erro
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center bg-zinc-800/70 backdrop-blur-sm"
        >
            <div
                className="relative w-full max-w-5xl mx-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-700/50 mb-6">
                    <div className="flex text-white justify-center items-center gap-2">
                        <Users size={25} />
                        <h3 className="text-xl font-semibold text-white">
                            Visualizar Usuário - #{userData?.id || 'id'}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                        <X size={25} />
                    </button>
                </div>

                {/* Formulário */}
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-zinc-300 text-sm font-medium mb-2">Nome</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-zinc-700/50 text-zinc-300 border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                                placeholder="Nome do usuário"
                               
                            />
                        </div>

                        <div>
                            <label className="block text-zinc-300 text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-700/50 text-zinc-300 border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                                placeholder="email@exemplo.com"
                               
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-zinc-300 text-sm font-medium mb-2">Perfil</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200"
                               
                            >
                                <option value="">Selecione o perfil</option>
                                <option value="admin">Administrador</option>
                                <option value="user">Usuário</option>
                                <option value="technician">Técnico</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-zinc-300 text-sm font-medium mb-2">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200"
                            >
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                                <option value="Suspenso">Suspenso</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-zinc-300 text-sm font-medium mb-2">Nova Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                            placeholder="Digite nova senha (deixe vazio para manter a atual)"
                        />
                    </div>
                    

                    {/* Mensagens de feedback */}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-300 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <p className="text-green-300 text-sm text-center">{success}</p>
                        </div>
                    )}

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer flex-1 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600/50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className=" cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed w-full"
                        >
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>

                {/* footer*/}
                <div className="w-full py-5 flex flex-col">
                    <div className="w-full border-t border-gray-700/50 mb-3"></div>

                   
                </div>
            </div>
        </div>
    );
}