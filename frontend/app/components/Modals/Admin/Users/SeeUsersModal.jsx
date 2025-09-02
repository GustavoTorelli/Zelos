'use client';
import { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';

export default function SeeUsersModal({ isOpen, onClose, userData = {} }) {
	if (!isOpen) return null;

	const [name, setName] = useState(userData?.name || '');
	const [email, setEmail] = useState(userData?.email || '');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState(userData?.role || '');
	const [categoryId, setCategoryId] = useState(
		userData?.categories?.[0] || ''
	);
	const [categoryName, setCategoryName] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	// Fetch category name for technician
	useEffect(() => {
		if (role === 'technician' && categoryId) {
			async function fetchCategoryName() {
				try {
					const token =
						typeof window !== 'undefined'
							? localStorage.getItem('token')
							: null;
					const headers =
						token && token.includes('.')
							? {
									Authorization: `Bearer ${token}`,
									'Content-Type': 'application/json',
							  }
							: { 'Content-Type': 'application/json' };

					const res = await fetch(`/api/categories`, {
						method: 'GET',
						headers,
						credentials: 'include',
					});

					if (!res.ok) throw new Error('Falha ao carregar categoria');

					const data = await res.json();
					const categories = Array.isArray(data)
						? data
						: Array.isArray(data.data)
						? data.data
						: [];
					const category = categories.find(
						(cat) => cat.id === parseInt(categoryId)
					);
					setCategoryName(
						category?.title || 'Categoria não encontrada'
					);
				} catch (err) {
					setError('Falha ao carregar categoria');
					setCategoryName('Erro ao carregar');
				}
			}

			fetchCategoryName();
		} else {
			setCategoryName('');
		}
	}, [role, categoryId]);

	const handleUpdate = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setLoading(true);

		try {
			if (!name.trim()) throw new Error('Nome é obrigatório');
			if (!email.trim()) throw new Error('Email é obrigatório');
			if (!role.trim()) throw new Error('Perfil é obrigatório');
			if (role === 'technician' && !categoryId)
				throw new Error('Categoria é obrigatória para técnico');

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) throw new Error('Email inválido');

			const token =
				typeof window !== 'undefined'
					? localStorage.getItem('token')
					: null;
			const headers =
				token && token.includes('.')
					? {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
					  }
					: { 'Content-Type': 'application/json' };

			const body = { name, email, role };
			if (password.trim()) body.password = password;
			if (role === 'technician' && categoryId)
				body.categories = [parseInt(categoryId)];

			const res = await fetch(`/api/users/${userData.id}`, {
				method: 'PUT',
				headers,
				body: JSON.stringify(body),
				credentials: 'include',
			});

			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(
					payload?.message || 'Falha ao atualizar usuário'
				);
			}

			setSuccess('Usuário atualizado com sucesso!');
			setPassword('');
			setTimeout(() => onClose(), 1200);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex justify-center items-center bg-zinc-800/70 backdrop-blur-sm">
			<div
				className="relative w-full max-w-5xl mx-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-start justify-between pb-4 border-b border-gray-700/50 mb-6">
					<div className="flex text-white justify-center items-center gap-2">
						<Users size={25} />
						<h3 className="text-xl font-semibold text-white">
							Editar Usuário - #{userData?.id || 'N/A'}
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
					>
						<X size={25} />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleUpdate} className="space-y-4">
					<div>
						<label className="block text-zinc-300 text-sm font-medium mb-1">
							Nome
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Nome do usuário"
							className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200"
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-zinc-300 text-sm font-medium mb-1">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="email@exemplo.com"
								className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200"
								required
							/>
						</div>
						<div>
							<label className="block text-zinc-300 text-sm font-medium mb-1">
								Perfil
							</label>
							<select
								value={role}
								onChange={(e) => setRole(e.target.value)}
								className="w-full cursor-pointer bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200"
								required
							>
								<option value="">Selecione o perfil</option>
								<option value="user">Usuário</option>
								<option value="technician">Técnico</option>
								<option value="admin">Administrador</option>
							</select>
						</div>
					</div>

					{role === 'technician' && (
						<div>
							<label className="block text-zinc-300 text-sm font-medium mb-1">
								Categoria
							</label>
							<input
								type="text"
								value={categoryName}
								disabled
								className="w-full bg-zinc-700/50 text-zinc-400 border border-zinc-600/50 rounded-lg p-3 cursor-not-allowed"
								placeholder="Carregando..."
							/>
						</div>
					)}

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
							className="cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{loading ? 'Salvando...' : 'Salvar Alterações'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
