'use client';
import { useState, useEffect } from "react";
import { Headset, X, User, Clock, MessageSquare, Send } from "lucide-react";

export default function SeeTicketsModal({ isOpen, onClose, ticketData = {} }) {
    if (!isOpen) return null;

    const [title, setTitle] = useState(ticketData?.title || "");
    const [patrimony, setPatrimony] = useState(ticketData?.patrimony_code || ticketData?.patrimony_id || "");
    const [description, setDescription] = useState(ticketData?.description || "");
    const [category, setCategory] = useState(ticketData?.category_id || "");
    const [status, setStatus] = useState(ticketData?.status || "");
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

    // Headers de autenticação
    const getHeaders = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token && token.trim().length > 0) {
            return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
        }
        return { "Content-Type": "application/json" };
    };

    // Dados do usuário
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No token found in localStorage");
                    return;
                }
                const response = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    const userData = data?.data || data;
                    setRole(userData?.role || "");
                } else {
                    console.error("Failed to fetch user data:", response.status, await response.text());
                }
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
            }
        };
        fetchUserData();
    }, []);

    // Técnicos
    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const response = await fetch("/api/users", { headers: getHeaders() });
                if (response.ok) {
                    const data = await response.json();
                    const usersData = data?.data || data || [];
                    const technicians = usersData.filter(user => user.role === "technician");
                    setTecnicos(technicians);
                } else {
                    console.error("Failed to fetch technicians:", response.status, await response.text());
                    setTecnicos([]);
                }
            } catch (error) {
                console.error("Error fetching technicians:", error);
                setTecnicos([]);
            }
        };
        fetchTechnicians();
    }, []);

    // Categorias
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/categories", { headers: getHeaders() });
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data?.data || data || []);
                } else {
                    console.error("Failed to fetch categories:", response.status, await response.text());
                    setCategories([]);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Worklogs
    const loadWorklogs = async () => {
        if (!ticketData?.id) {
            console.error("No ticket ID provided for fetching worklogs");
            return;
        }
        try {
            const response = await fetch(`/api/tickets/${ticketData.id}/worklogs`, {
                headers: getHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Worklogs response:", data); // Debugging
                setWorklogs(data?.data || data || []);
            } else {
                console.error("Failed to fetch worklogs:", response.status, await response.text());
                setWorklogs([]);
                setError("Failed to load worklogs");
            }
        } catch (error) {
            console.error("Error fetching worklogs:", error);
            setWorklogs([]);
            setError("Error loading worklogs");
        }
    };

    useEffect(() => {
        loadWorklogs();
    }, [ticketData?.id]);

    // Patrimônio
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
                } else {
                    console.error("Failed to fetch patrimony:", response.status, await response.text());
                    setPatrimonyData(null);
                }
            } catch (error) {
                console.error("Error fetching patrimony:", error);
                setPatrimonyData(null);
            }
        };
        fetchPatrimonyData();
    }, [patrimony]);

    // Sincronizar dados do ticket
    useEffect(() => {
        if (ticketData?.category_id) setCategory(ticketData.category_id);
        if (ticketData?.assigned_to) setTecnicoSelecionado(ticketData.assigned_to);
        if (ticketData?.status) setStatus(ticketData.status);
    }, [ticketData]);

    // Atualizar ticket
    const handleUpdateTicket = async () => {
        const canEdit = role === "admin" || role === "technician";
        if (!canEdit || !ticketData?.id) {
            setError("No permission or invalid ticket ID");
            return;
        }

        if (!title.trim()) return setError("Título é obrigatório");
        if (!description.trim()) return setError("Descrição é obrigatória");
        if (!category) return setError("Categoria é obrigatória");

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const updateData = {
                title: title.trim(),
                description: description.trim(),
                category_id: Number(category),
            };
            if (patrimony && patrimony.trim()) {
                updateData.patrimony_code = patrimony.trim();
            }
            const response = await fetch(`/api/tickets/${ticketData.id}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(updateData),
            });
            if (!response.ok) throw new Error(await response.text());
            setSuccess("Ticket atualizado com sucesso!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Erro ao atualizar ticket");
        } finally {
            setLoading(false);
        }
    };

    // Atualizar status
    const handleStatusChange = async (newStatus) => {
        setStatus(newStatus);
        if (!ticketData?.id) return;

        const canEdit = role === "admin" || role === "technician";
        if (!canEdit) {
            setError("Sem permissão para alterar status");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(`/api/tickets/${ticketData.id}/status`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error(await response.text());
            setSuccess("Status atualizado com sucesso!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Erro ao atualizar status");
            setStatus(ticketData?.status || "");
        } finally {
            setLoading(false);
        }
    };

    // Criar apontamento
    const handleCreateWorklog = async (e) => {
        e.preventDefault();
        if (!apontamento.trim()) return setError("Apontamento é obrigatório");

        const canEdit = role === "admin" || role === "technician";
        if (!canEdit) return setError("Sem permissão para criar apontamentos");

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const worklogResponse = await fetch(`/api/tickets/${ticketData.id}/worklogs`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ description: apontamento.trim() }),
            });
            if (!worklogResponse.ok) throw new Error(await worklogResponse.text());
            setSuccess("Apontamento criado com sucesso!");
            setApontamento("");
            await loadWorklogs();
        } catch (err) {
            console.error("Worklog creation error:", err);
            setError(err.message || "Erro ao criar apontamento");
        } finally {
            setLoading(false);
        }
    };

    // Selecionar técnico → atribui + muda status para in_progress
    const handleSelectTecnico = async (value) => {
        setTecnicoSelecionado(value);
        if (!value || !ticketData?.id) return;

        try {
            const assignResponse = await fetch(`/api/tickets/${ticketData.id}/assign`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify({ technician_id: Number(value) }),
            });
            if (!assignResponse.ok) throw new Error(await assignResponse.text());

            const statusResponse = await fetch(`/api/tickets/${ticketData.id}/status`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify({ status: "in_progress" }),
            });
            if (!statusResponse.ok) throw new Error(await statusResponse.text());
            setStatus("in_progress");
        } catch (err) {
            console.error("Erro ao atribuir técnico:", err);
            setError(err.message || "Erro ao atribuir técnico");
        }
    };

    // Concluir ticket
    const handleConcluir = async () => {
        if (!ticketData?.id) return;
        const canEdit = role === "admin" || role === "technician";
        if (!canEdit) return setError("Sem permissão para concluir tickets");

        if (!window.confirm("Tem certeza que deseja concluir este ticket?")) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(`/api/tickets/${ticketData.id}/status`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify({ status: "completed" }),
            });
            if (!response.ok) throw new Error(await response.text());
            setSuccess("Chamado concluído com sucesso!");
            setStatus("completed");
            setTimeout(() => onClose(), 2000);
        } catch (err) {
            setError(err.message || "Falha ao concluir chamado");
        } finally {
            setLoading(false);
        }
    };

    const canEdit = role === "admin" || role === "technician";

    // Status options
    const statusOptions = [
        { value: "pending", label: "Pendente" },
        { value: "in_progress", label: "Em Andamento" },
        { value: "completed", label: "Concluído" },
    ];

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
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                            <X size={25} />
                        </button>
                    </div>
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
                                        onChange={(e) => {
                                            console.log("Título alterado:", e.target.value);
                                            setTitle(e.target.value);
                                        }}
                                        disabled={!canEdit}
                                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Patrimônio</label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={patrimony}
                                            onChange={(e) => {
                                                console.log("Patrimônio alterado:", e.target.value);
                                                setPatrimony(e.target.value);
                                            }}
                                            disabled={!canEdit}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                                    <select
                                        value={category}
                                        onChange={(e) => {
                                            console.log("Categoria alterada:", e.target.value);
                                            setCategory(e.target.value);
                                        }}
                                        disabled={!canEdit}
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
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        disabled={!canEdit}
                                        className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
                                    >
                                        <option value="">Selecione o status</option>
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => {
                                        console.log("Descrição alterada:", e.target.value);
                                        setDescription(e.target.value);
                                    }}
                                    disabled={!canEdit}
                                    className="w-full h-32 resize-none bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
                                    placeholder="Descrição do problema..."
                                />
                            </div>

                            {canEdit && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            console.log("Botão de salvar clicado");
                                            handleUpdateTicket();
                                        }}
                                        disabled={loading}
                                       className=" cursor-pointer flex-1 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600/50 w-full"
                                    >
                                        {loading ? "Salvando..." : "Salvar Alterações"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            console.log("Botão de concluir clicado");
                                            handleConcluir();
                                        }}
                                        disabled={loading || status === "completed"}
                                         className=" cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600/50 w-full"
                                    >
                                        {loading ? "Concluindo..." : "Concluir Ticket"}
                                    </button>
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
                                            onChange={(e) => handleSelectTecnico(e.target.value)}
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
                                        className="w-full cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Send size={16} />
                                        {loading ? "Salvando..." : "Adicionar Apontamento"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Lista de Worklogs */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
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