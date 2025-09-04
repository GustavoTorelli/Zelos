'use client';
import { useState } from "react";
import { LibraryBig } from "lucide-react"; 

// Event emitter para comunicação entre componentes
class CategoryEventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
}

// Instância global (deve ser a mesma usada na TabelaDeCategorias)
const categoryEvents = typeof window !== 'undefined' && window.categoryEvents 
    ? window.categoryEvents 
    : new CategoryEventEmitter();

if (typeof window !== 'undefined') {
    window.categoryEvents = categoryEvents;
}

export default function NewCategoryModal({ isOpen, onClose, categoryData = null }) {
    if (!isOpen) return null;

    const [title, setTitle] = useState(categoryData?.title || "");
    const [description, setDescription] = useState(categoryData?.description || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isEditing = Boolean(categoryData);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!title.trim()) throw new Error("Título é obrigatório");
            if (!description.trim()) throw new Error("Descrição é obrigatória");

            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers = token && token.includes('.') ?
                { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } :
                { 'Content-Type': 'application/json' };

            const body = { title, description };

            const url = isEditing ? `/api/categories/${categoryData.id}` : '/api/categories';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.message || `Falha ao ${isEditing ? 'atualizar' : 'criar'} categoria`);
            }

            const responseData = await res.json();
            const categoryResult = responseData.data || responseData;

            setSuccess(`Categoria ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);


            if (isEditing) {
                console.log('Disparando evento categoryUpdated para:', categoryResult);
                categoryEvents.emit('categoryUpdated', categoryResult);
            } else {
                console.log('Disparando evento categoryCreated para:', categoryResult);
                categoryEvents.emit('categoryCreated', categoryResult);
            }

            if (!isEditing) {
                setTitle("");
                setDescription("");
            }

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
                {/* Título */}
                <div className="flex gap-2 pb-4 border-b border-gray-700/50 text-white mb-6">
                    <LibraryBig  size={25} />
                    <h3 className="text-xl font-semibold text-white">
                        {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
                    </h3>
                </div>

                {/* Formulário */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Título */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                        placeholder="Título da categoria"
                        maxLength={50}
                        required
                    />

                    {/* Descrição */}
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 min-h-[100px] focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200 placeholder-zinc-400"
                        placeholder="Descrição da categoria"
                        maxLength={70}
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
                            className="cursor-pointer flex-1 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600/50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className=" cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar' : 'Criar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Função utilitária para uso em outros componentes (opcional)
export const triggerCategoryRefresh = {
    created: (categoryData) => categoryEvents.emit('categoryCreated', categoryData),
    updated: (categoryData) => categoryEvents.emit('categoryUpdated', categoryData),
    deleted: (categoryId) => categoryEvents.emit('categoryDeleted', { id: categoryId })
};