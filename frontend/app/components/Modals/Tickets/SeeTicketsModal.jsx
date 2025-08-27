'use client';
import { useState, useEffect } from "react";
import { Headset, X } from "lucide-react";

export default function SeeTicketsModal({ isOpen, onClose, ticketData = {} }) {
    if (!isOpen) return null;

    const [title, setTitle] = useState(ticketData?.title || "");
    const [patrimony, setPatrimony] = useState(ticketData?.patrimony_id || "");
    const [description, setDescription] = useState(ticketData?.description || "");
    const [category, setCategory] = useState(ticketData?.category_id || "");

    const [apontamento, setApontamento] = useState("");
    const [tecnicoSelecionado, setTecnicoSelecionado] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [role, setRole] = useState("");
    const [tecnicos, setTecnicos] = useState([]);

    // pega role do usuário logado
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setRole(data?.role || ""))
            .catch(() => setRole(""));
    }, []);

    // carrega lista de técnicos da API
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        fetch("/api/users", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                const onlyTechs = (data || []).filter(u => u.role === "technician");
                setTecnicos(onlyTechs);
            })
            .catch(() => setTecnicos([]));
    }, []);

    const getHeaders = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return token && token.includes(".")
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" };
    };

    const handleUpdateApontamento = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!apontamento.trim()) throw new Error("Apontamento é obrigatório");
            if (!tecnicoSelecionado) throw new Error("Selecione um técnico");

            await fetch(`/api/tickets/${ticketData.id}/assign`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify({ technician_id: tecnicoSelecionado }),
            });

            await fetch(`/api/tickets/${ticketData.id}/worklogs`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ description: apontamento }),
            });

            await fetch(`/api/tickets/${ticketData.id}/status`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify({ status: "in_progress" }),
            });

            setSuccess("Apontamento atualizado com sucesso!");
            setApontamento("");
            setTimeout(() => setSuccess(""), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConcluir = async () => {
        if (!ticketData?.id) return;

        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/tickets/${ticketData.id}/status`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify({ status: "completed" }), 
            });

            if (!res.ok) throw new Error("Erro ao concluir ticket");

            setSuccess("Chamado concluído com sucesso!");
            setTimeout(() => setSuccess(""), 2000);
        } catch (err) {
            setError("Falha ao concluir chamado");
        } finally {
            setLoading(false);
        }
    };

    const isUser = role === "user";

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
                {/* header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-700/50 mb-6">
                    <div className="flex text-white justify-center items-center gap-2 ">
                        <Headset size={25} />
                        <h3 className="text-xl font-semibold text-white">
                            Visualizar Chamado - #{ticketData?.id || 'id'}
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

                {/* form */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* dados do chamado */}
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isUser}
                                className="w-full bg-zinc-700/30 text-zinc-300 border border-zinc-600/50 rounded-lg p-3"
                            />

                            <input
                                type="text"
                                value={patrimony}
                                onChange={(e) => setPatrimony(e.target.value)}
                                disabled={isUser}
                                className="w-full bg-zinc-700/30 text-zinc-300 border border-zinc-600/50 rounded-lg p-3"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={isUser}
                            className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3"
                        >
                            <option value="">Selecione a categoria</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Software">Software</option>
                            <option value="Rede">Rede</option>
                            <option value="Manutenção">Manutenção</option>
                            <option value="Outros">Outros</option>
                        </select>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isUser}
                            className="w-full h-40 md:h-8/12 resize-none bg-zinc-700/30 text-zinc-300 border border-zinc-600/50 rounded-lg p-3"
                        />
                    </div>

                    {/* apontamentos */}
                    <div className="w-full md:w-5/12 border-t md:border-t-0 md:border-l border-gray-700/50 md:pl-6">
                        <h4 className="text-center text-lg font-medium text-white m-4 md:m-0 md:mb-4">Apontamentos Técnicos</h4>

                        <form onSubmit={handleUpdateApontamento} className="space-y-4">
                            <select
                                value={tecnicoSelecionado}
                                onChange={(e) => setTecnicoSelecionado(e.target.value)}
                                disabled={isUser}
                                className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200"
                            >
                                <option value="">Selecione o técnico</option>
                                {tecnicos.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>

                            <textarea
                                value={apontamento}
                                onChange={(e) => setApontamento(e.target.value)}
                                disabled={isUser}
                                className="w-full h-40 resize-none bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                                placeholder="Digite o apontamento..."
                                maxLength={1000}
                            />

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

                            {role !== "user" && (
                                <>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="cursor-pointer flex-1 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600/50 w-full"
                                    >
                                        {loading ? "Atualizando..." : "Atualizar"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleConcluir}
                                        disabled={loading}
                                        className="cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed w-full"
                                    >
                                        Concluir
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>

                <div className="w-full py-5 flex flex-col ">
                    <div className="w-full border-t border-gray-700/50 mb-3"></div>
                </div>
            </div>
        </div>
    );
}
