'use client'
import { useEffect, useMemo, useState } from "react";

export default function Solicitar() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ title: "", description: "", category_id: "", patrimony_id: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const authHeaders = useMemo(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const isJwt = token && token.includes('.');
        return isJwt ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch("/api/categories", { headers: { ...authHeaders }, credentials: 'include' });
                if (!res.ok) throw new Error("Falha ao carregar categorias");
                const payload = await res.json();
                setCategories(payload?.data || []);
            } catch (e) {
                console.error(e);
                if (e?.message?.includes('401') || e?.code === 401) {
                    window.location.href = '/';
                }
            }
        }
        loadCategories();
    }, [authHeaders]);

    async function onSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders },
                credentials: 'include',
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    category_id: Number(form.category_id),
                    patrimony_id: form.patrimony_id ? Number(form.patrimony_id) : undefined,
                }),
            });
            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.message || "Falha ao criar chamado");
            }
            setSuccess("Chamado criado com sucesso");
            setForm({ title: "", description: "", category_id: "", patrimony_id: "" });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="md:w-screen w-screen h-full flex flex-col items-center md:pt-15 py-5 md:py-0">
            {/* Titulo*/}
            <div className="mb-8 flex flex-col md:flex-row justify-between w-10/12">
                <div>
                    <h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
                        Solicitar chamado
                    </h1>
                    <div className="w-24 h-1 bg-red-700 rounded"></div>
                </div>
            </div>

            {/* formulario */}
            <form className="flex flex-col w-10/12 h-8/12 items-center justify-center" onSubmit={onSubmit}>
                <input
                    type="text"
                    className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                    placeholder="Título do chamado"
                    maxLength={120}
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                />

                <select
                    className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                    value={form.category_id}
                    onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                    required
                >
                    <option value="">Categoria</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                </select>

                <input
                    type="text"
                    className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                    placeholder="ID do Patrimônio (opcional)"
                    value={form.patrimony_id}
                    onChange={(e) => setForm((f) => ({ ...f, patrimony_id: e.target.value }))}
                />

                <textarea
                    name="message"
                    className="bg-gray-600/80 w-full h-65 resize-none text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                    placeholder="Descrição do Problema"
                    maxLength={200}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    required
                ></textarea>

                <div className="w-full flex items-start">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-4 hover:from-red-900 hover:to-red-900 transition ease-in-out duration-150 cursor-pointer w-full sm:w-64 disabled:opacity-60"
                    >
                        {submitting ? "Enviando..." : "Enviar"}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-3 w-full">{error}</p>}
                {success && <p className="text-green-500 mt-3 w-full">{success}</p>}
            </form>
        </section>
    )
}