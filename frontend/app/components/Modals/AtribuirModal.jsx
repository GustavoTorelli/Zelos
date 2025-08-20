'use client';
import { useState } from "react";
import { CirclePlay, Goal } from "lucide-react";

export default function StatusModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [nome, setNome] = useState("");
    const [patrimonioId, setPatrimonioId] = useState("");
    const [tipo, setTipo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center bg-zinc-950/70"
        >
            <div className="
               relative w-full max-w-lg sm:max-w-2xl md:max-w-3xl 
            mx-4
                flex flex-col
                 max-h-[90vh] overflow-y-auto
                 p-4 sm:p-6 
               bg-[#1d1e21] border border-zinc-600/95 
                rounded-lg space-y-4 shadow-lg
    
            ">
                {/* Header */}
                <div className="pb-2 border-b border-zinc-600/95 text-lg sm:text-xl font-semibold text-white flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
                    <div className="flex gap-2 justify-center items-center">
                        <h3>Apontamentos Técnicos -</h3>
                        <span>#ID</span>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-2">
                        <CirclePlay color="#ed8936" />
                        <span className="text-sm sm:text-lg font-semibold text-gray-100">dd/mm/aaaa</span>
                        <Goal color="#22c55e" />
                        <span className="text-sm sm:text-lg font-semibold text-gray-100">dd/mm/aaaa</span>
                    </div>
                </div>

                {/* Formulário */}
                <form
                    className="flex flex-col w-full items-center justify-center gap-3"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setError("");
                        setLoading(true);
                        try {
                            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                            const headers = token && token.includes('.') ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
                            const res = await fetch('/api/tickets', {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({
                                    title: nome || 'Chamado',
                                    description: descricao || 'Sem descrição',
                                    category_id: 1,
                                    patrimony_id: patrimonioId ? Number(patrimonioId) : undefined,
                                }),
                            });
                            if (!res.ok) {
                                const payload = await res.json().catch(() => ({}));
                                throw new Error(payload?.message || 'Falha ao criar chamado');
                            }
                            onClose();
                        } catch (err) {
                            setError(err.message);
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    {/* Nome e ID */}
                    <div className="flex flex-col sm:flex-row w-full gap-3">
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="bg-gray-600/80 flex-1 text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition hover:bg-gray-600/90"
                            placeholder="Nome do Patrimônio"
                            maxLength={80}
                        />

                        <input
                            type="text"
                            value={patrimonioId}
                            onChange={(e) => setPatrimonioId(e.target.value)}
                            className="bg-gray-600/80 flex-1 text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition hover:bg-gray-600/90"
                            placeholder="ID do Patrimônio"
                            disabled
                        />
                    </div>

                    {/* Tipo de Chamado */}
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition hover:bg-gray-600/90 mt-3"
                    >
                        <option value="">Tipo de Chamado</option>
                        <option value="manutencao">Manutenção</option>
                        <option value="apoio">Apoio Técnico</option>
                        <option value="outros">Outros</option>
                    </select>

                    {/* Descrição */}
                    <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="bg-gray-600/80 w-full h-40 resize-none text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition hover:bg-gray-600/90 mt-3"
                        placeholder="Descrição do Problema"
                        maxLength={200}
                    ></textarea>

                    {/* Atribuir Técnico */}
                    <select
                        className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition hover:bg-gray-600/90 mt-3"
                    >
                        <option value="">Atribuir Técnico</option>
                        <option value="tecnico1">Técnico 1</option>
                        <option value="tecnico2">Técnico 2</option>
                        <option value="tecnico3">Técnico 3</option>
                    </select>

                    {/* Botões */}
                    <div className="w-full flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer bg-gradient-to-r from-green-700 to-green-600 text-white font-bold py-2 px-4 rounded-md hover:from-green-800 hover:to-green-800 transition w-full disabled:opacity-60"
                        >
                            {loading ? 'Enviando...' : 'Atribuir'}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-2 px-4 rounded-md hover:from-orange-700 hover:to-orange-600 transition w-full"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={() => alert("Chamado excluído teste")}
                            className="cursor-pointer bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-2 px-4 rounded-md hover:from-red-800 hover:to-red-700 transition w-full"
                        >
                            Excluir
                        </button>
                    </div>
                    {error && <p className="text-red-500 w-full">{error}</p>}
                </form>
            </div>
        </div>
    );
}
