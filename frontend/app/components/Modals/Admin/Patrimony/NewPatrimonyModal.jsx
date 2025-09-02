'use client';
import { useState } from "react";
import { HousePlus } from "lucide-react";

export default function NewPatrimonyModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!name.trim()) throw new Error("Nome do ativo é obrigatório");
            if (!location.trim()) throw new Error("Localização é obrigatória");
            if (!code.trim()) throw new Error("Código é obrigatório");
            if (!description.trim()) throw new Error("Descrição é obrigatória");

            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const headers = token && token.includes(".")
                ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
                : { "Content-Type": "application/json" };

            const body = { name, location, code, description };

            const res = await fetch("/api/patrimonies", {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.message || "Falha ao criar patrimônio");
            }

            setSuccess("Patrimônio criado com sucesso!");
            setName("");
            setLocation("");
            setCode("");
            setDescription("");
            setTimeout(() => onClose(), 1200);
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
                    <HousePlus size={25} />
                    <h3 className="text-xl font-semibold text-white">Novo Patrimônio</h3>
                </div>

                {/* Formulário */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3"
                        placeholder="Nome do patrimônio"
                        maxLength={50}
                        required
                    />

                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3"
                        placeholder="Localização (ex: Sala 3)"
                        maxLength={50}
                        required
                    />

                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3"
                        placeholder="Código do patrimônio"
                        maxLength={50}
                        required
                    />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 min-h-[100px]"
                        placeholder="Descrição detalhada"
                        maxLength={70}
                        required
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

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer flex-1 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium py-3 px-4 rounded-lg border border-zinc-600/50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Criando..." : "Criar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
