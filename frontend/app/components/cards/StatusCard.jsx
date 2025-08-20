import { useMemo, useState } from 'react';
import VizualizarModal from '../Modals/VizualizarModal';
import { ChevronsRight } from 'lucide-react';

export default function StatusCard({ ticket, canAssign = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const color = useMemo(() => {
        switch (ticket?.status) {
            case 'pending':
                return '#F59E0B';
            case 'in_progress':
                return '#22C55E';
            case 'completed':
                return '#3B82F6';
            default:
                return '#22C55E';
        }
    }, [ticket?.status]);

    return (
        <div className="w-72 h-48 flex flex-col justify-between bg-[#1d1e21] rounded-xl shadow-[-4px_8px_15px_-9px_rgba(0,0,0,0.7)] p-5 m-2">
            <VizualizarModal isOpen={isOpen} onClose={() => setIsOpen(false)} ticketId={ticket?.id} />

            <div className="flex flex-col h-full gap-2">
                <div className="flex flex-col gap-2">
                    <div className="w-full h-1 rounded-full" style={{ backgroundColor: color }}></div>
                    <h1 className="text-sm font-semibold text-gray-100 tracking-wide">
                        Chamado <span style={{ color: color }}>#{ticket?.id}</span>
                    </h1>
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Título</span>
                    <span className="text-sm font-medium text-gray-200 truncate">{ticket?.title}</span>
                    <span className="text-xs text-gray-300">Status: <span className="font-medium">{ticket?.status}</span></span>
                </div>
            </div>

            <div className="flex justify-end mt-3">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-red-700 to-red-600 text-white py-2 px-4 rounded-md hover:from-red-800 hover:to-red-700 transition duration-150 flex justify-center items-center gap-1 cursor-pointer"
                >
                    Vizualizar
                    <ChevronsRight />
                </button>
                {canAssign && (ticket?.status === 'pending' || ticket?.status === 'completed') && (
                    <button
                        onClick={async () => {
                            try {
                                setAssigning(true);
                                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                                const headers = token && token.includes('.') ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
                                // This is a placeholder; real UI should let admin choose technician_id
                                const res = await fetch(`/api/tickets/${ticket.id}/assign`, {
                                    method: 'POST',
                                    headers,
                                    credentials: 'include',
                                    body: JSON.stringify({ technician_id: ticket?.technician_id || 1 }),
                                });
                                if (!res.ok) throw new Error('Falha ao atribuir');
                            } catch (e) {
                                if (e?.message?.includes('401') || e?.code === 401) {
                                    window.location.href = '/';
                                }
                            } finally {
                                setAssigning(false);
                            }
                        }}
                        disabled={assigning}
                        className="ml-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white py-2 px-4 rounded-md hover:from-blue-800 hover:to-blue-700 transition duration-150 cursor-pointer disabled:opacity-60"
                    >
                        {assigning ? 'Atribuindo...' : 'Atribuir'}
                    </button>
                )}
            </div>
        </div>
    )
}