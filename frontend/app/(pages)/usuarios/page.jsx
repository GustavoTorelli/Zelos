'use client';
import { useEffect, useState } from 'react';

export default function GestaoUsuarios() {
	const [users, setUsers] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	// Estados para filtros
	const [filters, setFilters] = useState({
		search: '',
		role: '',
		status: 'all', // 'all', 'active', 'inactive'
	});

	// Estados para modal
	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState('create'); // 'create' ou 'edit'
	const [selectedUser, setSelectedUser] = useState(null);

	// Estado do formulário
	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		role: 'user',
		categories: [],
	});

	const [submitting, setSubmitting] = useState(false);

	// Carregar dados iniciais
	useEffect(() => {
		loadUsers();
		loadCategories();
	}, []);

	const loadUsers = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/users', {
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					window.location.href = '/';
					return;
				}
				throw new Error('Erro ao carregar usuários');
			}

			const data = await response.json();
			if (data.success) {
				setUsers(data.data);
			}
		} catch (err) {
			console.error('Erro ao carregar usuários:', err);
			setError('Erro ao carregar usuários');
		} finally {
			setLoading(false);
		}
	};

	const loadCategories = async () => {
		try {
			const response = await fetch('/api/categories', {
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					setCategories(data.data);
				}
			}
		} catch (err) {
			console.error('Erro ao carregar categorias:', err);
		}
	};

	// Filtrar usuários
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
			user.email.toLowerCase().includes(filters.search.toLowerCase());

		const matchesRole = filters.role === '' || user.role === filters.role;

		const matchesStatus =
			filters.status === 'all' ||
			(filters.status === 'active' && user.is_active) ||
			(filters.status === 'inactive' && !user.is_active);

		return matchesSearch && matchesRole && matchesStatus;
	});

	// Abrir modal para criar usuário
	const openCreateModal = () => {
		setForm({
			name: '',
			email: '',
			password: '',
			role: 'user',
			categories: [],
		});
		setModalMode('create');
		setSelectedUser(null);
		setShowModal(true);
	};

	// Abrir modal para editar usuário
	const openEditModal = (user) => {
		setForm({
			name: user.name,
			email: user.email,
			password: '',
			role: user.role,
			categories:
				user.Technician_Category?.map((tc) => tc.Category.id) || [],
		});
		setModalMode('edit');
		setSelectedUser(user);
		setShowModal(true);
	};

	// Fechar modal
	const closeModal = () => {
		setShowModal(false);
		setSelectedUser(null);
		setError('');
		setSuccess('');
	};

	// Submeter formulário
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError('');
		setSuccess('');

		try {
			const payload = {
				name: form.name.trim(),
				email: form.email.trim(),
				role: form.role,
			};

			// Adicionar senha apenas se fornecida (obrigatória para criação)
			if (modalMode === 'create' || form.password.trim()) {
				payload.password = form.password;
			}

			// Adicionar categorias apenas para técnicos
			if (form.role === 'technician' && form.categories.length > 0) {
				payload.categories = form.categories;
			}

			const url =
				modalMode === 'create'
					? `${process.env.BACKEND_BASE_URL}/users`
					: `${process.env.BACKEND_BASE_URL}/users/${selectedUser.id}`;

			const method = modalMode === 'create' ? 'POST' : 'PUT';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(payload),
			});

			const data = await response.json();

			if (!response.ok) {
				if (response.status === 401) {
					window.location.href = '/';
					return;
				}
				throw new Error(
					data.message ||
						`Erro ao ${
							modalMode === 'create' ? 'criar' : 'atualizar'
						} usuário`
				);
			}

			setSuccess(
				`Usuário ${
					modalMode === 'create' ? 'criado' : 'atualizado'
				} com sucesso!`
			);
			loadUsers(); // Recarregar lista

			// Fechar modal após 2 segundos
			setTimeout(() => {
				closeModal();
			}, 2000);
		} catch (err) {
			console.error('Erro ao submeter formulário:', err);
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	// Ativar/Desativar usuário
	const toggleUserStatus = async (user) => {
		try {
			const action = user.is_active ? 'deactivate' : 'activate';
			const response = await fetch(`api/users/${user.id}/${action}`, {
				method: 'PATCH',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					window.location.href = '/';
					return;
				}
				throw new Error(
					`Erro ao ${
						action === 'activate' ? 'ativar' : 'desativar'
					} usuário`
				);
			}

			setSuccess(
				`Usuário ${
					action === 'activate' ? 'ativado' : 'desativado'
				} com sucesso!`
			);
			loadUsers(); // Recarregar lista

			// Limpar mensagem após 3 segundos
			setTimeout(() => setSuccess(''), 3000);
		} catch (err) {
			console.error('Erro ao alterar status:', err);
			setError(err.message);
			setTimeout(() => setError(''), 3000);
		}
	};

	const getRoleBadge = (role) => {
		const styles = {
			admin: 'bg-purple-100 text-purple-800',
			technician: 'bg-blue-100 text-blue-800',
			user: 'bg-green-100 text-green-800',
		};

		const labels = {
			admin: 'Admin',
			technician: 'Técnico',
			user: 'Usuário',
		};

		return (
			<span
				className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}
			>
				{labels[role]}
			</span>
		);
	};

	const getStatusBadge = (isActive) => {
		return (
			<span
				className={`px-2 py-1 rounded-full text-xs font-medium ${
					isActive
						? 'bg-green-100 text-green-800'
						: 'bg-red-100 text-red-800'
				}`}
			>
				{isActive ? 'Ativo' : 'Inativo'}
			</span>
		);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
			</div>
		);
	}

	return (
		<section className="md:w-screen w-screen h-full flex flex-col items-center md:pt-15 py-5 md:py-0">
			{/* Título */}
			<div className="mb-8 flex flex-col md:flex-row justify-between w-11/12">
				<div>
					<h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
						Gestão de Usuários
					</h1>
					<div className="w-24 h-1 bg-red-700 rounded"></div>
				</div>
				<div className="mt-4 md:mt-0">
					<button
						onClick={openCreateModal}
						className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md hover:from-red-900 hover:to-red-900 transition ease-in-out duration-150"
					>
						Novo Usuário
					</button>
				</div>
			</div>

			{/* Filtros */}
			<div className="w-11/12 mb-6 bg-gray-600/80 rounded-lg p-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<input
						type="text"
						placeholder="Buscar por nome ou email..."
						className="bg-gray-700/80 text-white border-0 rounded-md p-2 focus:bg-gray-700 focus:outline-none"
						value={filters.search}
						onChange={(e) =>
							setFilters({ ...filters, search: e.target.value })
						}
					/>

					<select
						className="bg-gray-700/80 text-white border-0 rounded-md p-2 focus:bg-gray-700 focus:outline-none"
						value={filters.role}
						onChange={(e) =>
							setFilters({ ...filters, role: e.target.value })
						}
					>
						<option value="">Todos os perfis</option>
						<option value="admin">Admin</option>
						<option value="technician">Técnico</option>
						<option value="user">Usuário</option>
					</select>

					<select
						className="bg-gray-700/80 text-white border-0 rounded-md p-2 focus:bg-gray-700 focus:outline-none"
						value={filters.status}
						onChange={(e) =>
							setFilters({ ...filters, status: e.target.value })
						}
					>
						<option value="all">Todos os status</option>
						<option value="active">Apenas ativos</option>
						<option value="inactive">Apenas inativos</option>
					</select>
				</div>
			</div>

			{/* Mensagens */}
			{error && (
				<div className="w-11/12 mb-4 p-3 bg-red-900/20 border border-red-500 text-red-400 rounded-md">
					{error}
				</div>
			)}

			{success && (
				<div className="w-11/12 mb-4 p-3 bg-green-900/20 border border-green-500 text-green-400 rounded-md">
					{success}
				</div>
			)}

			{/* Tabela */}
			<div className="w-11/12 bg-gray-600/80 rounded-lg overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-white">
						<thead className="bg-gray-700/80">
							<tr>
								<th className="px-4 py-3 text-left">Nome</th>
								<th className="px-4 py-3 text-left">Email</th>
								<th className="px-4 py-3 text-left">Perfil</th>
								<th className="px-4 py-3 text-left">Status</th>
								<th className="px-4 py-3 text-left">
									Categorias
								</th>
								<th className="px-4 py-3 text-center">Ações</th>
							</tr>
						</thead>
						<tbody>
							{filteredUsers.length === 0 ? (
								<tr>
									<td
										colSpan="6"
										className="px-4 py-8 text-center text-gray-400"
									>
										Nenhum usuário encontrado
									</td>
								</tr>
							) : (
								filteredUsers.map((user) => (
									<tr
										key={user.id}
										className="border-b border-gray-700/50 hover:bg-gray-700/30"
									>
										<td className="px-4 py-3 font-medium">
											{user.name}
										</td>
										<td className="px-4 py-3 text-gray-300">
											{user.email}
										</td>
										<td className="px-4 py-3">
											{getRoleBadge(user.role)}
										</td>
										<td className="px-4 py-3">
											{getStatusBadge(user.is_active)}
										</td>
										<td className="px-4 py-3">
											{user.Technician_Category?.length >
											0 ? (
												<div className="flex flex-wrap gap-1">
													{user.Technician_Category.map(
														(tc, index) => (
															<span
																key={index}
																className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs"
															>
																{
																	tc.Category
																		.title
																}
															</span>
														)
													)}
												</div>
											) : (
												<span className="text-gray-400">
													-
												</span>
											)}
										</td>
										<td className="px-4 py-3">
											<div className="flex justify-center gap-2">
												<button
													onClick={() =>
														openEditModal(user)
													}
													className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
												>
													Editar
												</button>
												<button
													onClick={() =>
														toggleUserStatus(user)
													}
													className={`px-3 py-1 rounded text-sm transition ${
														user.is_active
															? 'bg-red-600 hover:bg-red-700 text-white'
															: 'bg-green-600 hover:bg-green-700 text-white'
													}`}
												>
													{user.is_active
														? 'Desativar'
														: 'Ativar'}
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold text-white">
								{modalMode === 'create'
									? 'Criar Usuário'
									: 'Editar Usuário'}
							</h2>
							<button
								onClick={closeModal}
								className="text-gray-400 hover:text-white transition"
								disabled={submitting}
							>
								✕
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-1">
									Nome *
								</label>
								<input
									type="text"
									required
									className="w-full bg-gray-700 text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none"
									value={form.name}
									onChange={(e) =>
										setForm({
											...form,
											name: e.target.value,
										})
									}
									disabled={submitting}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-1">
									Email *
								</label>
								<input
									type="email"
									required
									className="w-full bg-gray-700 text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none"
									value={form.email}
									onChange={(e) =>
										setForm({
											...form,
											email: e.target.value,
										})
									}
									disabled={submitting}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-1">
									Senha{' '}
									{modalMode === 'create'
										? '*'
										: '(deixe vazio para manter)'}
								</label>
								<input
									type="password"
									required={modalMode === 'create'}
									className="w-full bg-gray-700 text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none"
									value={form.password}
									onChange={(e) =>
										setForm({
											...form,
											password: e.target.value,
										})
									}
									disabled={submitting}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-1">
									Perfil *
								</label>
								<select
									required
									className="w-full bg-gray-700 text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none"
									value={form.role}
									onChange={(e) =>
										setForm({
											...form,
											role: e.target.value,
										})
									}
									disabled={submitting}
								>
									<option value="user">Usuário</option>
									<option value="technician">Técnico</option>
									<option value="admin">Admin</option>
								</select>
							</div>

							{form.role === 'technician' && (
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-1">
										Categorias
									</label>
									<div className="space-y-2 max-h-32 overflow-y-auto">
										{categories.map((category) => (
											<label
												key={category.id}
												className="flex items-center space-x-2"
											>
												<input
													type="checkbox"
													className="rounded"
													checked={form.categories.includes(
														category.id
													)}
													onChange={(e) => {
														if (e.target.checked) {
															setForm({
																...form,
																categories: [
																	...form.categories,
																	category.id,
																],
															});
														} else {
															setForm({
																...form,
																categories:
																	form.categories.filter(
																		(id) =>
																			id !==
																			category.id
																	),
															});
														}
													}}
													disabled={submitting}
												/>
												<span className="text-gray-300 text-sm">
													{category.title}
												</span>
											</label>
										))}
									</div>
								</div>
							)}

							{error && (
								<div className="p-3 bg-red-900/20 border border-red-500 text-red-400 rounded-md text-sm">
									{error}
								</div>
							)}

							{success && (
								<div className="p-3 bg-green-900/20 border border-green-500 text-green-400 rounded-md text-sm">
									{success}
								</div>
							)}

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={closeModal}
									className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition"
									disabled={submitting}
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-900 hover:to-red-900 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-60"
									disabled={submitting}
								>
									{submitting
										? 'Salvando...'
										: modalMode === 'create'
										? 'Criar'
										: 'Salvar'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</section>
	);
}
