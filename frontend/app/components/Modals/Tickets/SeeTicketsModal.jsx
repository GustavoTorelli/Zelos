'use client';
import { useState } from "react";
import {  Headset, X } from "lucide-react";

export default function SeeTicketsModal({ isOpen, onClose, ticketData = {} }) {
    if (!isOpen) return null;

    const [apontamento, setApontamento] = useState("");
    const [tecnicoSelecionado, setTecnicoSelecionado] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Lista de técnicos (pode vir de props ou API)
    const tecnicos = [
        { id: 1, nome: "João Silva" },
        { id: 2, nome: "Maria Santos" },
        { id: 3, nome: "Pedro Oliveira" },
        { id: 4, nome: "Ana Costa" },
        { id: 5, nome: "Carlos Ferreira" }
    ];

    const handleUpdateApontamento = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!apontamento.trim()) throw new Error("Apontamento é obrigatório");
            if (!tecnicoSelecionado) throw new Error("Selecione um técnico");

            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers = token && token.includes('.') ?
                { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } :
                { 'Content-Type': 'application/json' };

            const res = await fetch(`/api/tickets/${ticketData.id}/update`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    apontamento: apontamento,
                    tecnico_id: tecnicoSelecionado
                }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.message || 'Falha ao atualizar apontamento');
            }

            setSuccess("Apontamento atualizado com sucesso!");
            setApontamento("");
            setTimeout(() => {
                setSuccess("");
            }, 2000);
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
                className="relative w-full max-w-5xl mx-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* id onclose */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-700/50 mb-6">
                    {/* título e id */}
                    <div className="flex text-white justify-center items-center gap-2 ">
                        <Headset size={25}/>
                        <h3 className="text-xl font-semibold text-white">
                            Visualizar Chamado - #{ticketData?.id || 'id'}
                        </h3>

                    </div>

                    {/* botão fechar */}
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
                                placeholder={ticketData.title || "Nome do Patrimônio"}
                                readOnly
                                className="w-full bg-zinc-700/30 text-zinc-300 border border-zinc-600/50 rounded-lg p-3  placeholder-zinc-400"
                            />

                            <input
                                type="text"
                                placeholder={ticketData.patrimony_id || "ID do Patrimônio"}
                                readOnly
                                className="w-full bg-zinc-700/30 text-zinc-300 border border-zinc-600/50 rounded-lg p-3 placeholder-zinc-400"
                            />
                        </div>

                        {/* categorias */}
                        <select
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

                        {/* descrição */}
                        <textarea
                            placeholder={ticketData.description || "Descrição do problema..."}
                            className="w-full  h-40 md:h-8/12 resize-none bg-zinc-700/30 text-zinc-300 border border-zinc-600/50 rounded-lg p-3  placeholder-zinc-400 "
                        />
                    </div>

                    {/* apontamentos */}
                    <div className="w-full md:w-5/12 border-t md:border-t-0 md:border-l border-gray-700/50 md:pl-6">
                        <h4 className="text-center text-lg font-medium text-white m-4 md:m-0 md:mb-4">Apontamentos Técnicos</h4>

                        <form onSubmit={handleUpdateApontamento} className="space-y-4">
                            {/* técnico */}
                            <select
                                value={tecnicoSelecionado}
                                onChange={(e) => setTecnicoSelecionado(e.target.value)}
                                className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200"
                                required
                            >
                                <option value="">Selecione o técnico</option>
                                {tecnicos.map((tecnico) => (
                                    <option key={tecnico.id} value={tecnico.id}>
                                        {tecnico.nome}
                                    </option>
                                ))}
                            </select>

                            {/* apontamento */}
                            <textarea
                                value={apontamento}
                                onChange={(e) => setApontamento(e.target.value)}
                                className="w-full h-40 resize-none bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                                placeholder="Digite o apontamento..."
                                maxLength={1000}
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

                            {/* botão para atualizar */}
                            <button
                                type="submit"
                                disabled={loading}
                                className=" cursor-pointer flex-1 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600/50 w-full"
                            >
                                {loading ? 'Atualizando...' : 'Atualizar'}
                            </button>

                            <button
                                type="submit"

                                className=" cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed w-full"
                            >
                                Concluir
                            </button>


                        </form>
                    </div>
                </div>
                {/* datas */}
                <div className="w-full py-5 flex flex-col ">
                    <div className="w-full border-t border-gray-700/50 mb-3"></div>

                    {/* infos de datas */}
                    <div className="flex flex-wrap gap-2 justify-center  text-sm text-gray-400">
                        <p>
                            Solicitado em:{" "}
                            {ticketData?.createdAt
                                ? new Date(ticketData.createdAt).toLocaleDateString("pt-BR")
                                : "dd/mm/aaaa"}
                        </p>
                        <p>|</p>
                        <p>
                            Concluído em:{" "}
                            {ticketData?.finishedAt
                                ? new Date(ticketData.finishedAt).toLocaleDateString("pt-BR")
                                : "dd/mm/aaaa"}
                        </p>
                    </div>
                </div>


            </div>
        </div >
    );
}