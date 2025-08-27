'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
	const router = useRouter();
	const [resetMode, setResetMode] = useState(false);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	// Verificar autenticação inicial
	useEffect(() => {
		const checkAuth = async () => {
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

			if (!token) {
				setIsLoading(false);
				return;
			}

			try {
				const res = await fetch('/api/auth/me', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (res.ok) {
					const { data } = await res.json();
					localStorage.setItem('user_id', data.id);
					localStorage.setItem('user_role', data.role);
					router.push('/chamados');
				} else {
					localStorage.removeItem('token');
					localStorage.removeItem('user_id');
					localStorage.removeItem('user_role');
				}
			} catch {
				localStorage.removeItem('token');
				localStorage.removeItem('user_id');
				localStorage.removeItem('user_role');
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, [router]);

	const handleLogin = async (e) => {
		e.preventDefault();
		setError('');

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: username, password }),
			});

			if (!res.ok) {
				const errData = await res.json();
				setError(errData.message || 'Credenciais inválidas');
				return;
			}

			const { data } = await res.json(); // Agora sempre tem data.token
			const token = data.token;

			// Salvar no localStorage
			localStorage.setItem('token', token);
			// Opcional: buscar dados do usuário usando /me
			const meRes = await fetch('/api/auth/me', {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (meRes.ok) {
				const { data: meData } = await meRes.json();
				localStorage.setItem('user_id', meData.id);
				localStorage.setItem('user_role', meData.role);
			}

			router.push('/chamados');
		} catch {
			setError('Erro de conexão. Tente novamente.');
		}
	};

	// Tela de carregamento
	if (isLoading) {
		return (
			<section className="w-screen h-screen flex items-center justify-center bg-black">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-700 mx-auto mb-4"></div>
					<p className="text-white">Verificando autenticação...</p>
				</div>
			</section>
		);
	}

	return (
		<section className="w-screen h-screen flex flex-col items-center md:justify-center md:bg-[url('/img/global/senai.png')] md:bg-cover bg-black ">
			<header className="fixed top-0 left-0 z-50 w-full h-16 bg-zinc-900 flex items-center justify-between px-6 md:hidden">
				<div className="absolute left-1/2 transform -translate-x-1/2 md:static md:ml-0 flex items-center justify-center w-auto h-full">
					<img
						src="/img/global/logo_branco.svg"
						className="h-9"
						alt="Logo"
					/>
				</div>
			</header>

			<div className="flex flex-col md:items-center md:justify-center h-screen dark md:w-200 w-80 items-center justify-evenly">
				<div className="w-full max-w-md bg-zinc-900/70 rounded-xl shadow-lg p-8 py-10">
					<h2 className="text-2xl font-bold text-gray-200 mb-8">
						{resetMode ? 'Recuperar Senha' : 'Bem vindo ao Zelos'}
					</h2>

					{/* Formulário de login */}
					{!resetMode && (
						<form className="flex flex-col" onSubmit={handleLogin}>
							<input
								placeholder="E-mail"
								className="bg-gray-600/80 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
								type="email"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>

							<div className="relative mb-2">
								<input
									placeholder="Senha"
									className="bg-gray-600/80 text-white border-0 rounded-md p-2 pr-10 w-full focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-150"
								>
									{showPassword ? (
										// Ícone de olho fechado
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
											/>
										</svg>
									) : (
										// Ícone de olho aberto
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
									)}
								</button>
							</div>

							<div className="flex justify-end p-1">
								<button
									type="button"
									onClick={() => setResetMode(true)}
									className="relative text-sm text-white/70 cursor-pointer hover:text-white font-semibold transition-colors duration-300 group"
								>
									Esqueceu a senha?
									<span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-red-700 transition-all duration-300 group-hover:w-full"></span>
								</button>
							</div>

							<button
								className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-2 hover:from-red-900 hover:to-red-800 transition ease-in-out duration-150 cursor-pointer disabled:opacity-50"
								type="submit"
								disabled={!username || !password}
							>
								Entrar
							</button>

							{error && (
								<p className="text-red-500 mt-2 text-sm text-center">
									{error}
								</p>
							)}
						</form>
					)}

					{/* Formulário de recuperação */}
					{resetMode && (
						<form className="flex flex-col">
							<input
								placeholder="Digite seu e-mail"
								className="bg-gray-600/80 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
								type="email"
							/>
							<button
								className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-2 hover:from-red-900 hover:to-red-800 transition ease-in-out duration-150 cursor-pointer"
								type="submit"
							>
								Enviar
							</button>

							<div className="flex justify-center pt-5">
								<button
									type="button"
									onClick={() => setResetMode(false)}
									className="relative text-sm text-white/70 cursor-pointer hover:text-white font-semibold transition-colors duration-300 group"
								>
									Voltar ao login
									<span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-red-700 transition-all duration-300 group-hover:w-full"></span>
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</section>
	);
}
