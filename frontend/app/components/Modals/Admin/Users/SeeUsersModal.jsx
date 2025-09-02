'use client';
import { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';

export default function SeeUsersModal({ isOpen, onClose, userData = {} }) {
	if (!isOpen) return null;

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState('');
	const [category_id, setcategory_id] = useState(''); // string for select value
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [categories, setCategories] = useState([]);

	const getHeaders = () => {
		const token =
			typeof window !== 'undefined'
				? localStorage.getItem('token')
				: null;
		return token && token.includes('.')
			? {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
			  }
			: { 'Content-Type': 'application/json' };
	};

	useEffect(() => {
		if (!isOpen) return;

		setError('');
		setSuccess('');
		setPassword('');

		const initialName = userData?.name || '';
		const initialEmail = userData?.email || '';
		const initialRole = userData?.role || '';

		let initialCategory = '';

		if (
			Array.isArray(userData?.categories) &&
			userData.categories.length > 0
		) {
			const first = userData.categories[0];
			initialCategory =
				typeof first === 'object' && first !== null
					? String(first.id ?? first.category_id ?? first)
					: String(first);
		} else if (
			Array.isArray(userData?.Technician_Category) &&
			userData.Technician_Category.length > 0
		) {
			initialCategory = String(
				userData.Technician_Category[0].category_id
			);
		} else if (userData?.category_id) {
			initialCategory = String(userData.category_id);
		}

		setName(initialName);
		setEmail(initialEmail);
		setRole(initialRole);
		setcategory_id(initialCategory);
	}, [isOpen, userData]);

	useEffect(() => {
		let mounted = true;
		async function fetchCategories() {
			try {
				const res = await fetch('/api/categories', {
					method: 'GET',
					headers: getHeaders(),
					credentials: 'include',
				});
				if (!res.ok) throw new Error('Falha ao carregar categorias');
				const payload = await res.json();
				const data = Array.isArray(payload)
					? payload
					: Array.isArray(payload?.data)
					? payload.data
					: [];
				if (mounted) setCategories(data);
			} catch (err) {
				if (mounted) setCategories([]);
			}
		}
		if (isOpen) fetchCategories();
		return () => {
			mounted = false;
		};
	}, [isOpen]);

	const handleUpdate = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setLoading(true);

		try {
			if (!name.trim()) throw new Error('Nome é obrigatório');
			if (!email.trim()) throw new Error('Email é obrigatório');
			if (!role.trim()) throw new Error('Perfil é obrigatório');
			if (role === 'technician' && !String(category_id).trim())
				throw new Error('Categoria é obrigatória para técnico');

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) throw new Error('Email inválido');

			const body = { name, email, role };
			if (password.trim()) body.password = password;
			if (role === 'technician' && String(category_id).trim()) {
				body.categories = [Number(category_id)];
			} else {
				body.categories = []; // make explicit if backend expects removal when not technician
			}

			const res = await fetch(`/api/users/${userData.id}`, {
				method: 'PUT',
				headers: getHeaders(),
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
			setError(err.message || 'Erro ao atualizar usuário');
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
				<div className="flex items-start justify-between pb-4 border-b border-gray-700/50 mb-6">
					<div className="flex text-white justify-center items-center gap-2">
						<Users size={25} />
						<h3 className="text-xl font-semibold text-white">
							Editar Usuário - #{userData?.id ?? 'N/A'}
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
							maxLength={60}
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
								maxLength={50}
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
							<select
								value={category_id}
								onChange={(e) => setcategory_id(e.target.value)}
								className="w-full cursor-pointer bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 focus:bg-zinc-700 focus:border-zinc-500 focus:outline-none transition-all duration-200"
								required
							>
								<option value="">
									Selecione uma categoria
								</option>
								{categories.map((cat) => (
									<option key={cat.id} value={String(cat.id)}>
										{cat.title}
									</option>
								))}
							</select>
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
