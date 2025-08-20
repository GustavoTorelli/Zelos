'use client' //status user e adimuin tem acesso
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck } from "lucide-react";
import StatusCard from "../cards/StatusCard";
import StatusButton from "../button/StatusButton";

export default function Atribuir() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState('');

    const authHeaders = useMemo(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const isJwt = token && token.includes('.');
        return isJwt ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
                const res = await fetch(`/api/tickets${qs}`, { headers: { ...authHeaders }, credentials: 'include' });
                if (!res.ok) throw new Error("Falha ao carregar chamados");
                const payload = await res.json();
                setTickets(payload?.data || []);
            } catch (e) {
                setError(e.message);
                if (e?.message?.includes('401') || e?.code === 401) {
                    window.location.href = '/';
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [authHeaders, statusFilter]);

    return (
        <section className="md:w-screen h-full flex flex-col items-center md:pt-15 py-5 md:py-0">
            <div className="mb-8 flex flex-col md:flex-row justify-between w-10/12 gap-4 md:gap-0">
                <div>
                    <h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
                        Status do Chamado
                    </h1>
                    <div className="w-24 h-1 bg-red-700 rounded"></div>
                </div>
                <StatusButton
                    initialIndex={0}
                    onSelect={(s) => setStatusFilter(s?.value || '')}
                />
            </div>

            <section className="flex flex-wrap items-center w-12/12 justify-center h-auto">
                {loading && (
                    <div className='flex flex-col items-center p-10 justify-center w-full h-60 bg-[#1d1e21] rounded-xl gap-5 shadow-[-4px_8px_15px_-9px_rgba(0,_0,_0,_0.7)]'>
                        <h1 className='w-full text-center text-2xl md:text-3xl p-5 text-white font-semibold'>Carregando...</h1>
                    </div>
                )}
                {!loading && tickets.length === 0 && (
                    <div className='flex flex-col items-center p-10 justify-center w-full h-60 bg-[#1d1e21] rounded-xl gap-5 shadow-[-4px_8px_15px_-9px_rgba(0,_0,_0,_0.7)]'>
                        <BadgeCheck size={180} color='#B91C1C' />
                        <h1 className='w-full text-center text-2xl md:text-3xl p-5 text-white font-semibold'>
                            Você não solicitou nenhum chamado.
                        </h1>
                    </div>
                )}
                {error && (
                    <p className="text-red-500 w-full text-center">{error}</p>
                )}
                {tickets.map((t) => (
                    <StatusCard key={t.id} ticket={t} />
                ))}
            </section>
        </section>
    )
}