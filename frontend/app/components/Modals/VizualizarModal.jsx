'use client';
import { useEffect, useState } from "react";
import { CirclePlay, Goal } from "lucide-react";

export default function VizualizarModal({ isOpen, onClose, ticketId }) {
    const [ticket, setTicket] = useState(null);
    const [worklogs, setWorklogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !ticketId) return;
        let active = true;
        async function load() {
            setLoading(true);
            try {
                const headers = {};
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (token && token.includes('.')) headers['Authorization'] = `Bearer ${token}`;
                const [tRes, wRes] = await Promise.all([
                    fetch(`/api/tickets/${ticketId}`, { headers, credentials: 'include' }),
                    fetch(`/api/tickets/${ticketId}/worklogs`, { headers, credentials: 'include' }),
                ]);
                if (tRes.ok) {
                    const t = await tRes.json();
                    if (active) setTicket(t?.data || null);
                }
                if (wRes.ok) {
                    const w = await wRes.json();
                    if (active) setWorklogs(w?.data || []);
                }
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => {
            active = false;
        }
    }, [isOpen, ticketId]);

    if (!isOpen) return null;

    const tecnico = ticket?.Technician?.name || 'Não atribuído';
    
    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center bg-zinc-950/70"
        >
            <div className="
                relative w-full max-w-lg sm:max-w-xl md:max-w-2xl
                mx-4
                flex flex-col
                max-h-[90vh] overflow-y-auto
                p-4 sm:p-6
                bg-[#1d1e21] border border-zinc-600/95 
                rounded-lg space-y-4 shadow-lg
            ">
                {/* Header */}
                <div className="pb-2 border-b border-zinc-600/95 rounded-t text-lg sm:text-xl font-semibold text-white flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
                    <div className="flex gap-2 justify-center items-center">
                        <h3>Chamado</h3>
                        <span>#{ticketId}</span>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-2">
                        <CirclePlay color="#ed8936" />
                        <span className="text-sm sm:text-lg font-semibold text-gray-100">{ticket?.started_at ? new Date(ticket.started_at).toLocaleString() : '—'}</span>
                        <Goal color="#22c55e" />
                        <span className="text-sm sm:text-lg font-semibold text-gray-100">{ticket?.closed_at ? new Date(ticket.closed_at).toLocaleString() : '—'}</span>
                    </div>
                </div>

                {/* Dados */}
                {loading ? (
                    <div className="text-gray-200 p-2">Carregando...</div>
                ) : (
                    <div className="text-gray-200 text-justify p-2">
                        <div className="mb-2">
                            <span className="font-semibold">Título: </span>{ticket?.title}
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold">Técnico: </span>{tecnico}
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold">Categoria: </span>{ticket?.Category?.title || '—'}
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold">Status: </span>{ticket?.status}
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold mb-1">Apontamentos</h4>
                            {worklogs.length === 0 ? (
                                <div className="text-gray-400">Nenhum apontamento.</div>
                            ) : (
                                <ul className="list-disc pl-5 space-y-1">
                                    {worklogs.map(w => (
                                        <li key={w.id}>
                                            <span className="text-gray-300">{new Date(w.created_at).toLocaleString()} - </span>
                                            <span>{w.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {/* Botão de Ok */}
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-2 px-6 rounded-md hover:from-red-800 hover:to-red-700 transition ease-in-out duration-150 cursor-pointer"
                    >
                        Ok
                    </button>
                </div>
            </div>
        </div>
    );
}
