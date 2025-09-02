'use client';
import { useState, useEffect, useRef } from 'react';
import { Headset, Search } from 'lucide-react';

export default function NewticketModal({ isOpen, onClose, onTicketCreated }) {
	if (!isOpen) return null;

	const [nome, setNome] = useState('');
	const [patrimonioCode, setPatrimonioCode] = useState('');
	const [patrimonioData, setPatrimonioData] = useState(null);
	const [categoriaId, setCategoriaId] = useState('');
	const [descricao, setDescricao] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const [categories, setCategories] = useState([]);
	const [patrimonies, setPatrimonies] = useState([]);
	const [showPatrimonyDropdown, setShowPatrimonyDropdown] = useState(false);
	const [filteredPatrimonies, setFilteredPatrimonies] = useState([]);

	const patrimonioInputRef = useRef(null);
	const dropdownRef = useRef(null);

	const authHeaders = {
		'Content-Type': 'application/json',
		...(typeof window !== 'undefined' &&
		localStorage.getItem('token') &&
		localStorage.getItem('token').includes('.')
			? { Authorization: `Bearer ${localStorage.getItem('token')}` }
			: {}),
	};

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const res = await fetch('/api/categories', {
					headers: authHeaders,
				});
				if (!res.ok) throw new Error('Erro ao buscar categorias');
				const data = await res.json();
				const items = Array.isArray(data) ? data : data.data || [];
				setCategories(items);
			} catch (err) {
				console.error(err);
				setCategories([]);
			}
		};

		const fetchPatrimonies = async () => {
			try {
				const res = await fetch('/api/patrimonies', {
					headers: authHeaders,
				});
				if (!res.ok) throw new Error('Erro ao buscar patrimônios');
				const data = await res.json();
				const items = Array.isArray(data) ? data : data.data || [];
				setPatrimonies(items);
			} catch (err) {
				console.error(err);
				setPatrimonies([]);
			}
		};

		fetchCategories();
		fetchPatrimonies();
	}, []);

	useEffect(() => {
		if (patrimonioCode.trim()) {
			const filtered = patrimonies.filter(
				(patrimony) =>
					patrimony.code
						?.toLowerCase()
						.includes(patrimonioCode.toLowerCase()) ||
					patrimony.name
						?.toLowerCase()
						.includes(patrimonioCode.toLowerCase()) ||
					patrimony.location
						?.toLowerCase()
						.includes(patrimonioCode.toLowerCase())
			);
			setFilteredPatrimonies(filtered);
			setShowPatrimonyDropdown(filtered.length > 0);
		} else {
			setFilteredPatrimonies([]);
			setShowPatrimonyDropdown(false);
			setPatrimonioData(null);
		}
	}, [patrimonioCode, patrimonies]);

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

	// Corrigido: Função para selecionar patrimônio
	const selectPatrimony = (patrimony) => {
		setPatrimonioCode(patrimony.code);
		setPatrimonioData(patrimony);
		setShowPatrimonyDropdown(false);
		setFilteredPatrimonies([]); // Limpar as sugestões filtradas
		setError('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setLoading(true);

		try {
			if (!nome.trim()) throw new Error('Título é obrigatório');
			if (!categoriaId) throw new Error('Categoria é obrigatória');
			if (!descricao.trim()) throw new Error('Descrição é obrigatória');

			const res = await fetch('/api/tickets', {
				method: 'POST',
				headers: authHeaders,
				body: JSON.stringify({
					title: nome,
					description: descricao,
					category_id: Number(categoriaId),
					patrimony_code: patrimonioData
						? patrimonioData.code
						: undefined,
				}),
			});

			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(payload?.message || 'Falha ao criar chamado');
			}

			const newTicket = await res.json();
			setSuccess('Chamado criado com sucesso!');

			setNome('');
			setDescricao('');
			setCategoriaId('');
			setPatrimonioCode('');
			setPatrimonioData(null);
			setFilteredPatrimonies([]); // Limpar sugestões ao resetar form

			if (onTicketCreated) {
				onTicketCreated(newTicket.data || newTicket);
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

	// Corrigido: Função para limpar a seleção de patrimônio
	const clearPatrimonySelection = () => {
		setPatrimonioCode('');
		setPatrimonioData(null);
		setFilteredPatrimonies([]);
		setShowPatrimonyDropdown(false);
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
				<div className="flex gap-2 pb-4 border-b border-gray-700/50 text-white mb-6">
					<Headset size={25} />
					<h3 className="text-xl font-semibold text-white text-center">
						Solicitar Chamado
					</h3>
				</div>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<input
						type="text"
						value={nome}
						onChange={(e) => setNome(e.target.value)}
						className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3"
						placeholder="Título do chamado"
						maxLength={50}
						required
					/>

					<div className="space-y-2 relative">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search size={16} className="text-gray-400" />
							</div>
							<input
								ref={patrimonioInputRef}
								type="text"
								value={patrimonioCode}
								onChange={(e) => {
									setPatrimonioCode(e.target.value);
									// Se o usuário está digitando algo diferente do patrimônio selecionado, limpar a seleção
									if (
										patrimonioData &&
										e.target.value !== patrimonioData.code
									) {
										setPatrimonioData(null);
									}
								}}
								onFocus={() => {
									if (
										patrimonioCode.trim() &&
										filteredPatrimonies.length > 0
									) {
										setShowPatrimonyDropdown(true);
									}
								}}
								className="w-full bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3 pl-10"
								placeholder="Digite o código ou nome do patrimônio"
							/>
							{/* Botão para limpar seleção */}
							{patrimonioData && (
								<button
									type="button"
									onClick={clearPatrimonySelection}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
								>
									×
								</button>
							)}
						</div>

						{showPatrimonyDropdown &&
							filteredPatrimonies.length > 0 && (
								<div
									ref={dropdownRef}
									className="absolute z-50 w-full mt-1 bg-zinc-700 border border-zinc-600 rounded-lg shadow-lg max-h-40 overflow-y-auto"
								>
									{filteredPatrimonies.map((patrimony) => (
										<div
											key={patrimony.id}
											onClick={() =>
												selectPatrimony(patrimony)
											}
											className="p-3 hover:bg-zinc-600 cursor-pointer text-white border-b border-zinc-600 last:border-b-0"
										>
											<div className="font-medium text-sm">
												#{patrimony.code}
											</div>
											<div className="text-xs text-zinc-300">
												{patrimony.name}
											</div>
											<div className="text-xs text-zinc-400">
												{patrimony.location}
											</div>
										</div>
									))}
								</div>
							)}

						{patrimonioData && (
							<div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-2">
								Selecionado: {patrimonioData.name} -{' '}
								{patrimonioData.location}
							</div>
						)}
					</div>

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

					<textarea
						value={descricao}
						onChange={(e) => setDescricao(e.target.value)}
						className="w-full h-32 resize-none bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg p-3"
						placeholder="Descreva o problema detalhadamente..."
						maxLength={100}
						required
					/>

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
							className="cursor-pointer flex-1 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600/50 w-full"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={loading}
							className="cursor-pointer flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed w-full"
						>
							{loading ? 'Enviando...' : 'Enviar'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
