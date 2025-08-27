'use client';
import { useState, useEffect } from "react";
import { Headset } from "lucide-react";

export default function NewticketModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [nome, setNome] = useState("");
    const [patrimonioCode, setPatrimonioCode] = useState("");
    const [patrimonioData, setPatrimonioData] = useState(null);
    const [categoriaId, setCategoriaId] = useState("");
    const [descricao, setDescricao] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [categories, setCategories] = useState([]);

    // Buscar Categorias
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                if (!res.ok) throw new Error("Erro ao buscar categorias");
                const data = await res.json();
                const items = Array.isArray(data) ? data : data.data || [];
                setCategories(items);
            } catch (err) {
                console.error(err);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Buscar patrimônio quando o usuário digitar o código
    const handleBlurPatrimony = async () => {
        if (!patrimonioCode.trim()) {
            setPatrimonioData(null);
            return;
        }
        try {
            const res = await fetch(`/api/patrimonies/${patrimonioCode}`);
            if (!res.ok) throw new Error("Patrimônio não encontrado");
            const data = await res.json();
            setPatrimonioData(data);
            setError("");
        } catch (err) {
            setPatrimonioData(null);
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!nome.trim()) throw new Error("Título é obrigatório");
            if (!categoriaId) throw new Error("Categoria é obrigatória");
            if (!descricao.trim()) throw new Error("Descrição é obrigatória");

            const token =
                typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const headers =
                token && token.includes(".")
                    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
                    : { "Content-Type": "application/json" };

            const res = await fetch("/api/tickets", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    title: nome,
                    description: descricao,
                    category_id: Number(categoriaId),
                    patrimony_id: patrimonioData ? Number(patrimonioData.id) : undefined,
                }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.message || "Falha ao criar chamado");
            }

            setSuccess("Chamado criado com sucesso!");
            setNome("");
            setDescricao("");
            setCategoriaId("");
            setPatrimonioCode("");
            setPatrimonioData(null);
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
                    {/* Nome */}
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3"
                        placeholder="Título do chamado"
                        maxLength={80}
                        required
                    />

                    {/* Patrimônio (digitado) */}
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={patrimonioCode}
                            onChange={(e) => setPatrimonioCode(e.target.value)}
                            onBlur={handleBlurPatrimony}
                            className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3"
                            placeholder="Código do Patrimônio"
                        />
                        {patrimonioData && (
                            <div className="text-sm text-green-400">
                                Encontrado: {patrimonioData.name} - {patrimonioData.location}
                            </div>
                        )}
                    </div>

                    {/* Categoria */}
                    <select
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3"
                        required
                    >
                        <option value="">Selecione a categoria</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>

                    {/* Descrição */}
                    <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="w-full h-32 resize-none bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3"
                        placeholder="Descreva o problema detalhadamente..."
                        maxLength={500}
                        required
                    />

                    {/* Feedback */}
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
                            className=" cursor-pointer flex-1 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600/50 w-full"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                           className=" cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed w-full"
                        >
                            {loading ? "Enviando..." : "Enviar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
