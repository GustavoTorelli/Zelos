'use client';
import { useState } from "react";
import { Headset } from "lucide-react";

export default function NewticketModal({ isOpen, onClose, ticketId = 0 }) {
    if (!isOpen) return null;

    const [nome, setNome] = useState("");
    const [patrimonioId, setPatrimonioId] = useState(ticketId);
    const [tipo, setTipo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!nome.trim()) throw new Error("Nome do patrimônio é obrigatório");
            if (!tipo.trim()) throw new Error("Categoria é obrigatória");
            if (!descricao.trim()) throw new Error("Descrição é obrigatória");

            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers = token && token.includes('.') ?
                { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } :
                { 'Content-Type': 'application/json' };

            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: nome,
                    patrimony_id: patrimonioId == Number(patrimonioId),
                    category_id: 1,
                    description: descricao,
                    type: tipo
                }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.message || 'Falha ao criar chamado');
            }

            setSuccess("Chamado criado com sucesso!");
            setNome("");
            setDescricao("");
            setTipo("");
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
                {/* titulo*/}
                <div className="flex gap-2 pb-4 border-b border-gray-700/50 text-white mb-6">
                    <Headset size={25} />
                    <h3 className="text-xl font-semibold text-white text-center">
                        Solicitar Chamado
                    </h3>
                </div>

                {/* Formulário */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Nome e ID */}
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                            placeholder="Nome do Patrimônio"
                            maxLength={80}
                            required
                        />

                        <input
                            type="text"
                            value={patrimonioId}
                            onChange={(e) => setPatrimonioId(e.target.value)}
                            className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                            placeholder="ID do Patrimônio"
                        />
                    </div>

                    {/* Categoria */}
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200"
                        required
                    >
                        <option value="">Selecione a categoria</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Software">Software</option>
                        <option value="Rede">Rede</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Outros">Outros</option>
                    </select>

                    {/* Descrição */}
                    <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="w-full h-32 resize-none bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                        placeholder="Descreva o problema detalhadamente..."
                        maxLength={500}
                        required
                    />

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
                            className=" cursor-pointer flex-1 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600/50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className=" cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}