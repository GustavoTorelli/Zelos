'use client';
import { useState, useEffect } from "react";
import { Headset, X, User, Clock, MessageSquare, Send } from "lucide-react";

export default function SeeTicketsModal({ isOpen, onClose, ticketData = {} }) {
    if (!isOpen) return null;

    const [title, setTitle] = useState(ticketData?.title || "");
    const [patrimony, setPatrimony] = useState(ticketData?.patrimony_code || ticketData?.patrimony_id || "");
    const [description, setDescription] = useState(ticketData?.description || "");
    const [category, setCategory] = useState(ticketData?.category_id || "");

    const [apontamento, setApontamento] = useState("");
    const [tecnicoSelecionado, setTecnicoSelecionado] = useState(ticketData?.assigned_to || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [role, setRole] = useState("");
    const [tecnicos, setTecnicos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [worklogs, setWorklogs] = useState([]);
    const [patrimonyData, setPatrimonyData] = useState(null);

    // Função para buscar headers de autenticação
    const getHeaders = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return token && token.includes(".")
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" };
    };

    // Buscar dados do usuário logado
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    const userData = data?.data || data;
                    setRole(userData?.role || "");
                }
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
            }
        };

        fetchUserData();
    }, []);

    // Buscar técnicos da API /users com role "technician"
    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const response = await fetch("/api/users", {
                    headers: getHeaders(),
                });

                if (response.ok) {
                    const data = await response.json();
                    const usersData = data?.data || data || [];
                    const technicians = usersData.filter(user => user.role === "technician");
                    setTecnicos(technicians);
                }
            } catch (error) {
                console.error("Erro ao buscar técnicos:", error);
                setTecnicos([]);
            }
        };

        fetchTechnicians();
    }, []);

    // Buscar categorias
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/categories", {
                    headers: getHeaders(),
                });

                if (response.ok) {
                    const data = await response.json();
                    const categoriesData = data?.data || data || [];
                    setCategories(categoriesData);
                }
            } catch (error) {
                console.error("Erro ao buscar categorias:", error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    // Buscar worklogs do ticket
    useEffect(() => {
        const fetchWorklogs = async () => {
            if (!ticketData?.id) return;

            try {
                const response = await fetch(`/api/tickets/${ticketData.id}/worklogs`, {
                    headers: getHeaders(),
                });

                if (response.ok) {
                    const data = await response.json();
                    const worklogsData = data?.data || data || [];
                    setWorklogs(worklogsData);
                }
            } catch (error) {
                console.error("Erro ao buscar worklogs:", error);
                setWorklogs([]);
            }
        };

        fetchWorklogs();
    }, [ticketData?.id]);

    // Buscar dados do patrimônio se existir
    useEffect(() => {
        const fetchPatrimonyData = async () => {
            if (!patrimony) {
                setPatrimonyData(null);
                return;
            }

            try {
                const response = await fetch(`/api/patrimonies/${patrimony}`, {
                    headers: getHeaders(),
                });

                if (response.ok) {
                    const data = await response.json();
                    setPatrimonyData(data?.data || data);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do patrimônio:", error);
                setPatrimonyData(null);
            }
        };

        fetchPatrimonyData();
    }, [patrimony]);

    // Atualizar dados do ticket
    const handleUpdateTicket = async () => {
        if (role === "user") return; // Usuários comuns não podem editar

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const updateData = {
                title,
                description,
                category_id: Number(category),
            };

            const response = await fetch(`/api/tickets/${ticketData.id}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar ticket");
            }

            setSuccess("Ticket atualizado com sucesso!");
        } catch (err) {
            setError(err.message || "Erro ao atualizar ticket");
        } finally {
            setLoading(false);
        }
    };

    // Criar worklog (apontamento)
    const handleCreateWorklog = async (e) => {
        e.preventDefault();

        if (!apontamento.trim()) {
            setError("Apontamento é obrigatório");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // Criar worklog
            const worklogResponse = await fetch(`/api/tickets/${ticketData.id}/worklogs`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    description: apontamento
                }),
            });

            if (!worklogResponse.ok) {
                throw new Error("Erro ao criar apontamento");
            }

            // Se um técnico foi selecionado, atribuir o ticket
            if (tecnicoSelecionado && tecnicoSelecionado !== ticketData.assigned_to) {
                await fetch(`/api/tickets/${ticketData.id}/assign`, {
                    method: "PATCH",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        technician_id: tecnicoSelecionado
                    }),
                });
            }

            // Atualizar status para "in_progress" se ainda estiver pendente
            if (ticketData.status === "pending") {
                await fetch(`/api/tickets/${ticketData.id}/status`, {
                    method: "PATCH",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        status: "in_progress"
                    }),
                });
            }

            setSuccess("Apontamento criado com sucesso!");
            setApontamento("");

            // Recarregar worklogs
            const worklogsResponse = await fetch(`/api/tickets/${ticketData.id}/worklogs`, {
                headers: getHeaders(),
            });

            if (worklogsResponse.ok) {
                const data = await worklogsResponse.json();
                const worklogsData = data?.data || data || [];
                setWorklogs(worklogsData);
            }

        } catch (err) {
            setError(err.message || "Erro ao criar apontamento");
        } finally {
            setLoading(false);
        }
    };

    // Concluir ticket
    const handleConcluir = async () => {
        if (!ticketData?.id) return;

        const confirmConcluir = window.confirm("Tem certeza que deseja concluir este ticket?");
        if (!confirmConcluir) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(`/api/tickets/${ticketData.id}/status`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify({ status: "completed" }),
            });

            if (!response.ok) {
                throw new Error("Erro ao concluir ticket");
            }

            setSuccess("Chamado concluído com sucesso!");

            // Fechar modal após 2 segundos
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            setError(err.message || "Falha ao concluir chamado");
        } finally {
            setLoading(false);
        }
    };

    const isUser = role === "user";
    const canEdit = role === "admin" || role === "technician";

    // Mapear status para português
    const statusMap = {
        "pending": "Pendente",
        "in_progress": "Em Andamento",
        "completed": "Concluído",
        "cancelled": "Cancelado"
    };

    const statusColor = {
        "pending": "text-yellow-400",
        "in_progress": "text-blue-400",
        "completed": "text-green-400",
        "cancelled": "text-red-400"
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center bg-zinc-800/70 backdrop-blur-sm"
        >
            <div
                className="relative w-full max-w-6xl max-h-[90vh] mx-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <Headset size={25} className="text-red-500" />
                        <div>
                            <h3 className="text-xl font-semibold text-white">
                                Ticket #{ticketData?.id || 'N/A'}
                            </h3>
                            <p className={`text-sm font-medium ${statusColor[ticketData?.status] || 'text-gray-400'}`}>
                                Status: {statusMap[ticketData?.status] || ticketData?.status || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        <X size={25} />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)] overflow-hidden">
                    {/* Informações do Ticket */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <User size={20} />
                            Informações do Chamado
                        </h4>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={isUser}
                                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Patrimônio</label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={patrimony}
                                            onChange={(e) => setPatrimony(e.target.value)}
                                            disabled={isUser}
                                            className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
                                            placeholder="Código do patrimônio"
                                        />
                                        {patrimonyData && (
                                            <div className="text-sm text-green-400 bg-green-400/10 p-2 rounded">
                                                <strong>{patrimonyData.name}</strong> - {patrimonyData.location}
                                                {patrimonyData.description && (
                                                    <p className="text-xs text-green-300 mt-1">{patrimonyData.description}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    disabled={isUser}
                                    className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
                                >
                                    <option value="">Selecione a categoria</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.title || cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={isUser}
                                    className="w-full h-32 resize-none bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
                                    placeholder="Descrição do problema..."
                                />
                            </div>

                            {canEdit && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleUpdateTicket}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loading ? "Salvando..." : "Salvar Alterações"}
                                    </button>

                                    {ticketData?.status !== "completed" && (
                                        <button
                                            onClick={handleConcluir}
                                            disabled={loading}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Concluir Ticket
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Apontamentos */}
                    <div className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-gray-700/50 flex flex-col">
                        <div className="p-6 border-b border-gray-700/50">
                            <h4 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
                                <MessageSquare size={20} />
                                Apontamentos
                            </h4>

                            {canEdit && (
                                <form onSubmit={handleCreateWorklog} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Técnico Responsável</label>
                                        <select
                                            value={tecnicoSelecionado}
                                            onChange={(e) => setTecnicoSelecionado(e.target.value)}
                                            className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                        >
                                            <option value="">Selecione o técnico</option>
                                            {tecnicos.map((tecnico) => (
                                                <option key={tecnico.id} value={tecnico.id}>
                                                    {tecnico.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Novo Apontamento</label>
                                        <textarea
                                            value={apontamento}
                                            onChange={(e) => setApontamento(e.target.value)}
                                            className="w-full h-24 resize-none bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-zinc-400"
                                            placeholder="Digite o apontamento técnico..."
                                            maxLength={1000}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Send size={16} />
                                        {loading ? "Salvando..." : "Adicionar Apontamento"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Lista de Worklogs */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-3">
                                {worklogs.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">Nenhum apontamento encontrado</p>
                                ) : (
                                    worklogs.map((worklog) => (
                                        <div key={worklog.id} className="bg-zinc-700/30 rounded-lg p-4 border border-zinc-600/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-gray-400" />
                                                    <span className="text-xs text-gray-400">
                                                        {worklog.created_at ? new Date(worklog.created_at).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : 'Data não disponível'}
                                                    </span>
                                                </div>
                                                {worklog.technician && (
                                                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                                        {worklog.technician.name || 'Técnico'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-200">{worklog.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Messages */}
                {(error || success) && (
                    <div className="p-4 border-t border-gray-700/50">
                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg mb-2">
                                <p className="text-red-300 text-sm text-center">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                                <p className="text-green-300 text-sm text-center">{success}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}