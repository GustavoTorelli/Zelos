'use client';
import { useState, useEffect, useRef } from 'react';
import {
	Headset,
	X,
	User,
	Clock,
	MessageSquare,
	Send,
	Search,
} from 'lucide-react';

export default function SeeTicketsModal({
	isOpen,
	onClose,
	ticketData = {},
	onTicketUpdated,
}) {
	if (!isOpen) return null;

	const [title, setTitle] = useState(ticketData?.title || '');
	const [patrimony, setPatrimony] = useState(
		ticketData?.patrimony_code || ticketData?.patrimony_id || ''
	);
	const [description, setDescription] = useState(
		ticketData?.description || ''
	);
	const [category, setCategory] = useState(ticketData?.category_id || '');
	const [status, setStatus] = useState(ticketData?.status || '');
	const [apontamento, setApontamento] = useState('');
	const [tecnicoSelecionado, setTecnicoSelecionado] = useState(
		ticketData?.assigned_to ? String(ticketData.assigned_to) : ''
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [role, setRole] = useState('');
	const [userId, setUserId] = useState(null);
	const [tecnicos, setTecnicos] = useState([]);
	const [categories, setCategories] = useState([]);
	const [worklogs, setWorklogs] = useState([]);
	const [patrimonyData, setPatrimonyData] = useState(null);
	const [assignedTechnician, setAssignedTechnician] = useState(null);

	const [patrimonies, setPatrimonies] = useState([]);
	const [showPatrimonyDropdown, setShowPatrimonyDropdown] = useState(false);
	const [filteredPatrimonies, setFilteredPatrimonies] = useState([]);
	const [patrimonyEdited, setPatrimonyEdited] = useState(false);

	const patrimonioInputRef = useRef(null);
	const dropdownRef = useRef(null);
	const prevTicketIdRef = useRef(null);

	const getHeaders = () => {
		const token =
			typeof window !== 'undefined'
				? localStorage.getItem('token')
				: null;
		if (token && token.trim().length > 0) {
			return {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			};
		}
		return { 'Content-Type': 'application/json' };
	};

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const token = localStorage.getItem('token');
				if (!token) return;
				const response = await fetch('/api/auth/me', {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (response.ok) {
					const data = await response.json();
					const userData = data?.data || data;
					setRole(userData?.role || '');
					setUserId(userData?.id ?? null);
				}
			} catch {}
		};
		fetchUserData();
	}, []);

	useEffect(() => {
		const fetchTechnicians = async () => {
			try {
				let url = '/api/users?role=technician';
				if (category) url += `&category_id=${category}`;

				const response = await fetch(url, { headers: getHeaders() });
				if (response.ok) {
					const data = await response.json();
					const usersData = data?.data || data || [];
					const technicians = usersData.filter(
						(user) => user.role === 'technician'
					);
					setTecnicos(technicians);
				} else {
					setTecnicos([]);
				}
			} catch {
				setTecnicos([]);
			}
		};
		fetchTechnicians();
	}, [category]);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await fetch('/api/categories', {
					headers: getHeaders(),
				});
				if (response.ok) {
					const data = await response.json();
					setCategories(data?.data || data || []);
				} else {
					setCategories([]);
				}
			} catch {
				setCategories([]);
			}
		};
		fetchCategories();
	}, []);

	useEffect(() => {
		const fetchPatrimonies = async () => {
			try {
				const response = await fetch('/api/patrimonies', {
					headers: getHeaders(),
				});
				if (response.ok) {
					const data = await response.json();
					const patrimoniesData = data?.data || data || [];
					setPatrimonies(
						Array.isArray(patrimoniesData) ? patrimoniesData : []
					);
				} else {
					setPatrimonies([]);
				}
			} catch {
				setPatrimonies([]);
			}
		};
		fetchPatrimonies();
	}, []);

	useEffect(() => {
		if (patrimony && String(patrimony).trim()) {
			const p = String(patrimony).toLowerCase();
			const filtered = patrimonies.filter(
				(pat) =>
					pat.code?.toLowerCase().includes(p) ||
					pat.name?.toLowerCase().includes(p) ||
					(pat.description || '').toLowerCase().includes(p) ||
					(pat.location || '').toLowerCase().includes(p)
			);
			setFilteredPatrimonies(filtered);
			setShowPatrimonyDropdown(filtered.length > 0 && patrimonyEdited);
		} else {
			setFilteredPatrimonies([]);
			setShowPatrimonyDropdown(false);
			setPatrimonyData(null);
		}
	}, [patrimony, patrimonies, patrimonyEdited]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target) &&
				patrimonioInputRef.current &&
				!patrimonioInputRef.current.contains(event.target)
			) {
				setShowPatrimonyDropdown(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const selectPatrimony = (patrimonyItem) => {
		setPatrimony(patrimonyItem.code);
		setPatrimonyData(patrimonyItem);
		setShowPatrimonyDropdown(false);
		setFilteredPatrimonies([]);
		setPatrimonyEdited(false);
		setError('');
	};

	const clearPatrimonySelection = () => {
		setPatrimony('');
		setPatrimonyData(null);
		setFilteredPatrimonies([]);
		setShowPatrimonyDropdown(false);
		setPatrimonyEdited(false);
	};

	const loadWorklogs = async () => {
		if (!ticketData?.id) return;
		try {
			const response = await fetch(
				`/api/tickets/${ticketData.id}/worklogs`,
				{
					headers: getHeaders(),
				}
			);
			if (response.ok) {
				const data = await response.json();
				setWorklogs(data?.data || data || []);
			} else {
				setWorklogs([]);
				setError('Failed to load worklogs');
			}
		} catch {
			setWorklogs([]);
			setError('Error loading worklogs');
		}
	};

	useEffect(() => {
		loadWorklogs();
	}, [ticketData?.id]);

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
					setPatrimonyData(null);
				}
			} catch {
				setPatrimonyData(null);
			}
		};
		fetchPatrimonyData();
	}, [patrimony]);

	useEffect(() => {
		if (!ticketData) return;
		const currentId = ticketData?.id ?? null;
		if (prevTicketIdRef.current === currentId) return;
		prevTicketIdRef.current = currentId;

		setTitle(ticketData?.title || '');
		setDescription(ticketData?.description || '');
		setCategory(ticketData?.category_id || '');
		setStatus(ticketData?.status || '');
		setPatrimony(
			ticketData?.patrimony_code || ticketData?.patrimony_id || ''
		);
		setPatrimonyData(null);
		setPatrimonyEdited(false);

		const techObj = ticketData?.Technician || null;
		setAssignedTechnician(techObj);
		const techId =
			ticketData?.technician_id ??
			ticketData?.assigned_to ??
			techObj?.id ??
			null;
		setTecnicoSelecionado(techId ? String(techId) : '');
	}, [ticketData]);

	useEffect(() => {
		if (!tecnicoSelecionado) return;
		const exists = tecnicos.some(
			(t) => String(t.id) === String(tecnicoSelecionado)
		);
		if (!exists) setTecnicoSelecionado('');
	}, [tecnicos]);

	const handleUpdateTicket = async () => {
		const canEdit = role === 'admin' || role === 'technician';
		if (!canEdit || !ticketData?.id) {
			setError('No permission or invalid ticket ID');
			return;
		}

		if (!title.trim()) return setError('Título é obrigatório');
		if (!description.trim()) return setError('Descrição é obrigatória');
		if (!category) return setError('Categoria é obrigatória');

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const updateData = {
				title: title.trim(),
				description: description.trim(),
				category_id: Number(category),
			};
			if (role === 'admin' && patrimony && String(patrimony).trim()) {
				updateData.patrimony_code = String(patrimony).trim();
			}

			const putResponse = await fetch(`/api/tickets/${ticketData.id}`, {
				method: 'PUT',
				headers: getHeaders(),
				body: JSON.stringify(updateData),
			});
			if (!putResponse.ok) {
				const txt = await putResponse.text();
				throw new Error(txt || 'Failed to update ticket');
			}

			const originalTech =
				ticketData?.technician_id ??
				ticketData?.assigned_to ??
				ticketData?.Technician?.id ??
				null;
			if (
				String(tecnicoSelecionado || '') !== String(originalTech || '')
			) {
				if (tecnicoSelecionado) {
					const assignResponse = await fetch(
						`/api/tickets/${ticketData.id}/assign`,
						{
							method: 'PATCH',
							headers: getHeaders(),
							body: JSON.stringify({
								technician_id: Number(tecnicoSelecionado),
							}),
						}
					);
					if (!assignResponse.ok) {
						const txt = await assignResponse.text();
						throw new Error(txt || 'Failed to assign technician');
					}
				}
			}

			if (String(status || '') !== String(ticketData?.status || '')) {
				const statusResponse = await fetch(
					`/api/tickets/${ticketData.id}/status`,
					{
						method: 'PATCH',
						headers: getHeaders(),
						body: JSON.stringify({ status }),
					}
				);
				if (!statusResponse.ok) {
					const txt = await statusResponse.text();
					throw new Error(txt || 'Failed to update status');
				}
			}

			const finalResp = await fetch(`/api/tickets/${ticketData.id}`, {
				headers: getHeaders(),
			});
			if (!finalResp.ok) {
				const txt = await finalResp.text();
				throw new Error(txt || 'Failed to fetch updated ticket');
			}
			const finalJson = await finalResp.json();
			const updatedTicket = finalJson?.data || finalJson;

			if (updatedTicket) {
				setTitle(updatedTicket.title ?? title);
				setDescription(updatedTicket.description ?? description);
				setCategory(updatedTicket.category_id ?? category);
				setStatus(updatedTicket.status ?? status);

				const finalTechObj = updatedTicket?.Technician || null;
				setAssignedTechnician(finalTechObj);
				const finalTechId =
					updatedTicket?.technician_id ??
					updatedTicket?.assigned_to ??
					finalTechObj?.id ??
					null;
				setTecnicoSelecionado(finalTechId ? String(finalTechId) : '');

				if (updatedTicket?.Patrimony) {
					setPatrimony(updatedTicket.Patrimony.code ?? patrimony);
					setPatrimonyData(updatedTicket.Patrimony);
					setPatrimonyEdited(false);
				}
			}

			setSuccess('Ticket atualizado com sucesso!');
			if (onTicketUpdated) onTicketUpdated(updatedTicket);

			setTimeout(() => setSuccess(''), 3000);
		} catch (err) {
			setError(err.message || 'Erro ao atualizar ticket');
		} finally {
			setLoading(false);
		}
	};

	const handleSelfAssign = async () => {
		if (!ticketData?.id) return;
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			const resp = await fetch(`/api/tickets/${ticketData.id}/assign`, {
				method: 'PATCH',
				headers: getHeaders(),
			});
			if (!resp.ok) {
				const txt = await resp.text();
				throw new Error(txt || 'Failed to self assign');
			}

			const finalResp = await fetch(`/api/tickets/${ticketData.id}`, {
				headers: getHeaders(),
			});
			if (!finalResp.ok) {
				const txt = await finalResp.text();
				throw new Error(
					txt || 'Failed to fetch updated ticket after assign'
				);
			}
			const finalJson = await finalResp.json();
			const updatedTicket = finalJson?.data || finalJson;

			if (updatedTicket) {
				const finalTechObj = updatedTicket?.Technician || null;
				setAssignedTechnician(finalTechObj);
				const finalTechId =
					updatedTicket?.technician_id ??
					updatedTicket?.assigned_to ??
					finalTechObj?.id ??
					null;
				setTecnicoSelecionado(finalTechId ? String(finalTechId) : '');
				setStatus(updatedTicket.status ?? status);
				if (updatedTicket?.Patrimony) {
					setPatrimony(updatedTicket.Patrimony.code ?? patrimony);
					setPatrimonyData(updatedTicket.Patrimony);
				}
			}

			setSuccess('Autoatribuição realizada com sucesso!');
			if (onTicketUpdated) onTicketUpdated(updatedTicket);
			setTimeout(() => setSuccess(''), 3000);
		} catch (err) {
			setError(err.message || 'Erro ao autoatribuir');
		} finally {
			setLoading(false);
		}
	};

	const handleCreateWorklog = async (e) => {
		e.preventDefault();
		if (!apontamento.trim()) return setError('Apontamento é obrigatório');

		const canEdit = role === 'admin' || role === 'technician';
		if (!canEdit) return setError('Sem permissão para criar apontamentos');

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const worklogResponse = await fetch(
				`/api/tickets/${ticketData.id}/worklogs`,
				{
					method: 'POST',
					headers: getHeaders(),
					body: JSON.stringify({ description: apontamento.trim() }),
				}
			);
			if (!worklogResponse.ok)
				throw new Error(await worklogResponse.text());
			setSuccess('Apontamento criado com sucesso!');
			setApontamento('');
			await loadWorklogs();
			if (onTicketUpdated) onTicketUpdated();
		} catch (err) {
			setError(err.message || 'Erro ao criar apontamento');
		} finally {
			setLoading(false);
		}
	};

	const handleConcluir = async () => {
		if (!ticketData?.id) return;
		const canEdit = role === 'admin' || role === 'technician';
		if (!canEdit) return setError('Sem permissão para concluir tickets');

		if (!window.confirm('Tem certeza que deseja concluir este ticket?'))
			return;

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const response = await fetch(
				`/api/tickets/${ticketData.id}/status`,
				{
					method: 'PATCH',
					headers: getHeaders(),
					body: JSON.stringify({ status: 'completed' }),
				}
			);
			if (!response.ok) throw new Error(await response.text());
			setSuccess('Chamado concluído com sucesso!');
			setStatus('completed');
			if (onTicketUpdated) onTicketUpdated();
			setTimeout(() => onClose(), 2000);
		} catch (err) {
			setError(err.message || 'Falha ao concluir chamado');
		} finally {
			setLoading(false);
		}
	};

	const canEdit = role === 'admin' || role === 'technician';
	const canEditCategory = role === 'admin';

	const statusOptions = [
		{ value: 'pending', label: 'Pendente' },
		{ value: 'in_progress', label: 'Em Andamento' },
	];

	const assignedIsCurrentUser =
		assignedTechnician && String(assignedTechnician.id) === String(userId);

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
					<div className="flex-1 p-6 overflow-y-auto">
						<h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
							<User size={20} />
							Informações do Chamado
						</h4>

						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Título
									</label>
									<input
										type="text"
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
										disabled={!canEdit}
										className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Patrimônio
									</label>
									<div className="space-y-2 relative">
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<Search
													size={16}
													className="text-gray-400"
												/>
											</div>
											<input
												ref={patrimonioInputRef}
												type="text"
												value={patrimony}
												onChange={(e) => {
													setPatrimony(
														e.target.value
													);
													setPatrimonyEdited(true);
													if (
														patrimonyData &&
														e.target.value !==
															patrimonyData.code
													) {
														setPatrimonyData(null);
													}
												}}
												disabled={!canEdit}
												className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
												placeholder="Digite o código ou nome do patrimônio"
											/>
											{patrimonyData && canEdit && (
												<button
													type="button"
													onClick={
														clearPatrimonySelection
													}
													className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
												>
													×
												</button>
											)}
										</div>

										{showPatrimonyDropdown &&
											filteredPatrimonies.length > 0 &&
											canEdit && (
												<div
													ref={dropdownRef}
													className="absolute z-50 w-full mt-1 bg-zinc-700 border border-zinc-600 rounded-lg shadow-lg max-h-40 overflow-y-auto"
												>
													{filteredPatrimonies.map(
														(pat) => (
															<div
																key={pat.id}
																onClick={() =>
																	selectPatrimony(
																		pat
																	)
																}
																className="p-3 hover:bg-zinc-600 cursor-pointer text-white border-b border-zinc-600 last:border-b-0"
															>
																<div className="font-medium text-sm">
																	#{pat.code}
																</div>
																<div className="text-xs text-zinc-300">
																	{pat.name ||
																		pat.description}
																</div>
																<div className="text-xs text-zinc-400">
																	{
																		pat.location
																	}
																</div>
															</div>
														)
													)}
												</div>
											)}

										{patrimonyData && (
											<div className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-md p-2">
												<span className="font-medium">
													#{patrimonyData.code}
												</span>{' '}
												-{' '}
												{patrimonyData.name ||
													patrimonyData.description}
												{patrimonyData.location && (
													<span className="text-green-300/80 ml-1">
														(
														{patrimonyData.location}
														)
													</span>
												)}
											</div>
										)}
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Categoria
									</label>
									<select
										value={category}
										onChange={(e) =>
											setCategory(e.target.value)
										}
										disabled={!canEditCategory}
										className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
									>
										<option value="">
											Selecione a categoria
										</option>
										{categories.map((cat) => (
											<option key={cat.id} value={cat.id}>
												{cat.title || cat.name}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Status
									</label>
									<select
										value={status}
										onChange={(e) =>
											setStatus(e.target.value)
										}
										disabled={!canEdit}
										className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
									>
										{statusOptions.map((option) => (
											<option
												key={option.value}
												value={option.value}
											>
												{option.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Descrição
								</label>
								<textarea
									value={description}
									onChange={(e) =>
										setDescription(e.target.value)
									}
									disabled={!canEdit}
									className="w-full h-32 resize-none bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
									placeholder="Descrição do problema..."
								/>
							</div>

							{error && (
								<div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
									<p className="text-red-300 text-sm text-center">
										{error}
									</p>
								</div>
							)}
							{success && (
								<div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
									<p className="text-green-300 text-sm text-center">
										{success}
									</p>
								</div>
							)}

							{canEdit && (
								<div className="flex gap-3">
									<button
										onClick={handleUpdateTicket}
										disabled={loading}
										className="cursor-pointer flex-1 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600/50 w-full disabled:opacity-50"
									>
										{loading
											? 'Salvando...'
											: 'Salvar Alterações'}
									</button>
									<button
										onClick={handleConcluir}
										disabled={
											loading || status === 'completed'
										}
										className="cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 w-full"
									>
										{loading
											? 'Concluindo...'
											: 'Concluir Ticket'}
									</button>
								</div>
							)}
						</div>
					</div>

					<div className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-gray-700/50 flex flex-col">
						<div className="p-6 border-b border-gray-700/50">
							<h4 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
								<MessageSquare size={20} />
								Apontamentos
							</h4>

							{canEdit && (
								<form
									onSubmit={handleCreateWorklog}
									className="space-y-4"
								>
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Técnico Responsável
										</label>

										{/* Mostrar quem é o técnico responsável, se houver */}
										{assignedTechnician ? (
											<div className="mb-2">
												<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-700/30 text-sm">
													<span className="font-medium text-white">
														{assignedIsCurrentUser
															? 'Você'
															: assignedTechnician.name}
													</span>
													{assignedTechnician.email && (
														<span className="text-xs text-zinc-400">
															(
															{
																assignedTechnician.email
															}
															)
														</span>
													)}
												</div>
											</div>
										) : null}

										{role === 'technician' ? (
											// técnico logado: botão para autoatribuir quando não houver técnico (ou se já for o próprio técnico botão fica desabilitado)
											!assignedTechnician ||
											assignedIsCurrentUser ? (
												<button
													type="button"
													onClick={handleSelfAssign}
													disabled={
														loading ||
														assignedIsCurrentUser
													}
													className="w-full cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
												>
													{loading
														? 'Atribuindo...'
														: assignedIsCurrentUser
														? 'Você já está atribuído'
														: 'Se autoatribuir'}
												</button>
											) : null
										) : (
											// admin: permite selecionar técnico (pode ver/alterar)
											<select
												value={tecnicoSelecionado}
												onChange={(e) =>
													setTecnicoSelecionado(
														e.target.value
													)
												}
												className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50"
											>
												<option value="">
													{category
														? 'Selecione o técnico'
														: 'Selecione uma categoria primeiro'}
												</option>
												{tecnicos.map((tecnico) => (
													<option
														key={tecnico.id}
														value={String(
															tecnico.id
														)}
													>
														{tecnico.name}
													</option>
												))}
											</select>
										)}

										{category &&
											tecnicos.length === 0 &&
											role !== '' &&
											role !== 'technician' && (
												<p className="text-xs text-yellow-400 mt-1">
													Nenhum técnico disponível
													para esta categoria
												</p>
											)}
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Novo Apontamento
										</label>
										<textarea
											value={apontamento}
											onChange={(e) =>
												setApontamento(e.target.value)
											}
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
										{loading
											? 'Salvando...'
											: 'Adicionar Apontamento'}
									</button>
								</form>
							)}
						</div>

						<div className="flex-1 overflow-y-auto p-6">
							<div className="space-y-3 max-h-[300px] overflow-y-auto">
								{worklogs.length === 0 ? (
									<p className="text-gray-400 text-center py-8">
										Nenhum apontamento encontrado
									</p>
								) : (
									worklogs.map((worklog) => (
										<div
											key={worklog.id}
											className="bg-zinc-700/30 rounded-lg p-4 border border-zinc-600/30"
										>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													<Clock
														size={14}
														className="text-gray-400"
													/>
													<span className="text-xs text-gray-400">
														{worklog.created_at
															? new Date(
																	worklog.created_at
															  ).toLocaleDateString(
																	'pt-BR',
																	{
																		day: '2-digit',
																		month: '2-digit',
																		year: 'numeric',
																		hour: '2-digit',
																		minute: '2-digit',
																	}
															  )
															: 'Data não disponível'}
													</span>
												</div>
												{worklog.technician && (
													<span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
														{worklog.technician
															.name || 'Técnico'}
													</span>
												)}
											</div>
											<p className="text-sm text-gray-200">
												{worklog.description}
											</p>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
