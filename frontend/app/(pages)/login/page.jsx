'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function InputError({ message }) {
	if (!message) return null;
	return (
		<p className="text-red-500 mt-2 text-sm text-center" role="alert">
			{message}
		</p>
	);
}

const ERROR_MAP = {
	'Token is invalid or has expired':
		'O link de redefinição expirou. Solicite um novo.',
	'User does not exist': 'Usuário não encontrado.',
	'User account is inactive': 'A conta do usuário está inativa.',
	'Invalid request data': 'Email inválido.',
};

function translateError(message) {
	if (!message) return 'Ocorreu um erro inesperado. Tente novamente.';
	return (
		ERROR_MAP[message] ||
		message ||
		'Ocorreu um erro inesperado. Tente novamente.'
	);
}

export default function LoginPage() {
	const router = useRouter();
	const [resetMode, setResetMode] = useState(false);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	// recovery states
	const [recoveryEmail, setRecoveryEmail] = useState('');
	const [recoveryMessage, setRecoveryMessage] = useState('');
	const [recoveryError, setRecoveryError] = useState('');
	const [recoveryLoading, setRecoveryLoading] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			const token =
				typeof window !== 'undefined'
					? localStorage.getItem('token')
					: null;

			if (!token) {
				setIsLoading(false);
				return;
			}

			try {
				const res = await fetch('/api/auth/me', {
					headers: { Authorization: `Bearer ${token}` },
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

			const body = await res.json().catch(() => ({}));

			if (!res.ok || body.success === false) {
				const msg = body.message || 'Credenciais inválidas';
				setError(translateError(msg));
				return;
			}

			const { data } = body;
			const token = data.token;
			localStorage.setItem('token', token);

			const meRes = await fetch('/api/auth/me', {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (meRes.ok) {
				const { data: meData } = await meRes.json();
				localStorage.setItem('user_id', meData.id);
				localStorage.setItem('user_role', meData.role);
			}

			router.push('/chamados');
		} catch (err) {
			setError('Erro de conexão. Tente novamente.');
		}
	};

	const handlePasswordRecovery = async (e) => {
		e.preventDefault();
		setRecoveryError('');
		setRecoveryMessage('');

		if (!recoveryEmail) {
			setRecoveryError('Informe um e-mail válido.');
			return;
		}

		setRecoveryLoading(true);
		try {
			const localToken =
				typeof window !== 'undefined'
					? localStorage.getItem('token')
					: null;
			const headers = { 'Content-Type': 'application/json' };
			if (localToken) headers.Authorization = `Bearer ${localToken}`;

			const res = await fetch('/api/auth/password-recovery', {
				method: 'POST',
				headers,
				body: JSON.stringify({ email: recoveryEmail }),
			});

			const body = await res.json().catch(() => ({}));

			if (!res.ok || body.success === false) {
				const friendly = translateError(body.message);
				setRecoveryError(friendly);
				return;
			}

			setRecoveryMessage(
				'Se o e-mail existir, você receberá um link para redefinir sua senha.'
			);
			setRecoveryEmail('');
		} catch (err) {
			setRecoveryError('Erro de conexão. Tente novamente.');
		} finally {
			setRecoveryLoading(false);
		}
	};

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
									aria-label={
										showPassword
											? 'Ocultar senha'
											: 'Mostrar senha'
									}
								>
									{showPassword ? (
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
									onClick={() => {
										setResetMode(true);
										setRecoveryMessage('');
										setRecoveryError('');
									}}
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

							<InputError message={error} />
						</form>
					)}

					{resetMode && (
						<form
							className="flex flex-col"
							onSubmit={handlePasswordRecovery}
						>
							<input
								placeholder="Digite seu e-mail"
								className="bg-gray-600/80 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
								type="email"
								value={recoveryEmail}
								onChange={(e) =>
									setRecoveryEmail(e.target.value)
								}
								required
							/>

							<button
								className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-2 hover:from-red-900 hover:to-red-800 transition ease-in-out duration-150 cursor-pointer disabled:opacity-50"
								type="submit"
								disabled={recoveryLoading}
							>
								{recoveryLoading ? 'Enviando...' : 'Enviar'}
							</button>

							{recoveryMessage && (
								<p className="text-green-400 mt-3 text-sm text-center">
									{recoveryMessage}
								</p>
							)}
							<InputError message={recoveryError} />

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
