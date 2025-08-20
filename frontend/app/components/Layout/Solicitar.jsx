'use client';
import { useEffect, useState } from 'react';

export default function Solicitar() {
	const [categories, setCategories] = useState([]);
	const [form, setForm] = useState({
		title: '',
		description: '',
		category_id: '',
		patrimony_id: '',
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		async function loadCategories() {
			try {
				// Usando a rota correta da API
				const res = await fetch('/api/categories', {
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
				});

				if (!res.ok) {
					if (res.status === 401) {
						window.location.href = '/';
						return;
					}
					throw new Error('Falha ao carregar categorias');
				}

				const payload = await res.json();

				// Verificando se a resposta tem a estrutura esperada
				if (payload.success && payload.data) {
					setCategories(payload.data);
				} else {
					setCategories([]);
				}
			} catch (e) {
				console.error('Erro ao carregar categorias:', e);
				setError('Erro ao carregar categorias');

				if (e.message?.includes('401')) {
					window.location.href = '/';
				}
			}
		}
		loadCategories();
	}, []);

	async function onSubmit(e) {
		e.preventDefault();
		setSubmitting(true);
		setError('');
		setSuccess('');

		try {
			// Validação básica no frontend
			if (!form.title.trim()) {
				throw new Error('Título é obrigatório');
			}
			if (!form.description.trim()) {
				throw new Error('Descrição é obrigatória');
			}
			if (!form.category_id) {
				throw new Error('Categoria é obrigatória');
			}

			// Preparando o payload conforme esperado pela API
			const payload = {
				title: form.title.trim(),
				description: form.description.trim(),
				category_id: parseInt(form.category_id, 10),
			};

			// Adicionando patrimony_id apenas se fornecido
			if (form.patrimony_id && form.patrimony_id.trim()) {
				payload.patrimony_id = parseInt(form.patrimony_id.trim(), 10);
			}

			const res = await fetch('/api/tickets', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(payload),
			});

			const responseData = await res.json();

			if (!res.ok) {
				// Tratando diferentes tipos de erro da API
				if (res.status === 401) {
					window.location.href = '/';
					return;
				}

				if (res.status === 409) {
					throw new Error(
						'Já existe um chamado para este patrimônio'
					);
				}

				if (res.status === 400 && responseData.errors) {
					// Formatando erros de validação do Zod
					const errorMessages = Array.isArray(responseData.errors)
						? responseData.errors.join(', ')
						: responseData.errors;
					throw new Error(errorMessages);
				}

				throw new Error(
					responseData.message || 'Erro ao criar chamado'
				);
			}

			// Sucesso
			setSuccess('Chamado criado com sucesso!');

			// Limpando o formulário
			setForm({
				title: '',
				description: '',
				category_id: '',
				patrimony_id: '',
			});
		} catch (err) {
			console.error('Erro ao criar chamado:', err);
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<section className="md:w-screen w-screen h-full flex flex-col items-center md:pt-15 py-5 md:py-0">
			{/* Titulo */}
			<div className="mb-8 flex flex-col md:flex-row justify-between w-10/12">
				<div>
					<h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
						Solicitar chamado
					</h1>
					<div className="w-24 h-1 bg-red-700 rounded"></div>
				</div>
			</div>

			{/* Formulário */}
			<form
				className="flex flex-col w-10/12 h-8/12 items-center justify-center"
				onSubmit={onSubmit}
			>
				<input
					type="text"
					className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
					placeholder="Título do chamado"
					maxLength={120}
					value={form.title}
					onChange={(e) =>
						setForm((f) => ({ ...f, title: e.target.value }))
					}
					required
					disabled={submitting}
				/>

				<select
					className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
					value={form.category_id}
					onChange={(e) =>
						setForm((f) => ({ ...f, category_id: e.target.value }))
					}
					required
					disabled={submitting}
				>
					<option value="">Selecione uma categoria</option>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>
							{category.title}
						</option>
					))}
				</select>

				<input
					type="number"
					className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
					placeholder="ID do Patrimônio (opcional)"
					value={form.patrimony_id}
					onChange={(e) =>
						setForm((f) => ({ ...f, patrimony_id: e.target.value }))
					}
					min="1"
					disabled={submitting}
				/>

				<textarea
					name="description"
					className="bg-gray-600/80 w-full h-32 resize-none text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
					placeholder="Descrição do problema"
					maxLength={500}
					value={form.description}
					onChange={(e) =>
						setForm((f) => ({ ...f, description: e.target.value }))
					}
					required
					disabled={submitting}
				/>

				<div className="w-full flex items-start">
					<button
						type="submit"
						disabled={submitting}
						className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-4 hover:from-red-900 hover:to-red-900 transition ease-in-out duration-150 cursor-pointer w-full sm:w-64 disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{submitting ? 'Enviando...' : 'Enviar Chamado'}
					</button>
				</div>

				{error && (
					<div className="text-red-400 mt-3 w-full p-2 bg-red-900/20 rounded-md">
						{error}
					</div>
				)}

				{success && (
					<div className="text-green-400 mt-3 w-full p-2 bg-green-900/20 rounded-md">
						{success}
					</div>
				)}
			</form>
		</section>
	);
}
