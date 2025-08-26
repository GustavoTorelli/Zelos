'use client';
import { useState } from "react";
import { Users } from "lucide-react";

export default function NewUserModal({ isOpen, onClose, userData = null }) {
    if (!isOpen) return null;

    const [name, setName] = useState(userData?.name || "");
    const [email, setEmail] = useState(userData?.email || "");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(userData?.role || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isEditing = Boolean(userData);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!name.trim()) throw new Error("Nome é obrigatório");
            if (!email.trim()) throw new Error("Email é obrigatório");
            if (!role.trim()) throw new Error("Perfil é obrigatório");
            if (!isEditing && !password.trim()) throw new Error("Senha é obrigatória");

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
                role
            };

            // Só inclui senha se não estiver editando ou se foi preenchida
            if (!isEditing || password.trim()) {
                body.password = password;
            }

            const url = isEditing ? `/api/users/${userData.id}` : '/api/users';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.message || `Falha ao ${isEditing ? 'atualizar' : 'criar'} usuário`);
            }

            setSuccess(`Usuário ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);

            if (!isEditing) {
                setName("");
                setEmail("");
                setPassword("");
                setRole("");
            }

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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
                className="relative w-full max-w-lg mx-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Título */}
                <div className="flex gap-2 pb-4 border-b border-gray-700/50 text-white mb-6">
                    <Users size={25} />
                    <h3 className="text-xl font-semibold text-white">
                        {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                    </h3>
                </div>

                {/* Formulário */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Nome */}
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                        placeholder="Nome completo"
                        maxLength={100}
                        required
                    />

                    {/* Email */}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                        placeholder="email@exemplo.com"
                        required
                    />

                    {/* Senha */}
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                        placeholder={isEditing ? "Nova senha (deixe vazio para manter)" : "Senha"}
                        minLength={6}
                        required={!isEditing}
                    />

                    {/* Perfil/Role */}
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200"
                        required
                    >
                        <option value="">Selecione o perfil</option>
                        <option value="admin">Administrador</option>
                        <option value="user">Usuário</option>
                        <option value="technician">Técnico</option>
                        <option value="manager">Gerente</option>
                    </select>

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
                            className=" cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? ('Criando...') : ( 'Criar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}