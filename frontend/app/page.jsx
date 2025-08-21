'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
	const router = useRouter();
	const [resetMode, setResetMode] = useState(false);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	// Verificar se já está autenticado
	useEffect(() => {
		async function checkAuth() {
			console.log('🔍 [LOGIN] Verificando se já está autenticado...');

			try {
				// Usar a mesma URL base em todos os lugares
				const res = await fetch(`api/auth/me`, {
					credentials: 'include',
				});

				console.log('📡 [LOGIN] Resposta do /auth/me:', res.status);

				if (res.ok) {
					const response = await res.json();
					console.log(
						'✅ [LOGIN] Usuário já autenticado:',
						response.data
					);

					// Salvar dados no localStorage
					localStorage.setItem('user_id', response.data.id);
					localStorage.setItem('user_role', response.data.role);

					// Redirecionar para chamados
					router.push('/chamados');
				} else {
					console.log(
						'❌ [LOGIN] Usuário não autenticado, permanecendo na tela de login'
					);

					// Limpar qualquer dado antigo
					localStorage.removeItem('user_id');
					localStorage.removeItem('user_role');
				}
			} catch (error) {
				console.error(
					'💥 [LOGIN] Erro ao verificar autenticação:',
					error
				);

				// Em caso de erro, limpar localStorage
				localStorage.removeItem('user_id');
				localStorage.removeItem('user_role');
			} finally {
				setIsLoading(false);
			}
		}

		checkAuth();
	}, []); // ⚠️ Array vazio - executa apenas uma vez

	const handleLogin = async (e) => {
		e.preventDefault();
		setError('');

		console.log('🚀 [LOGIN] Tentando fazer login...');

		try {
			const res = await fetch(`api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					email: username,
					password: password,
				}),
			});

			console.log('📡 [LOGIN] Resposta do login:', res.status);

			if (!res.ok) {
				console.log('❌ [LOGIN] Login falhou');
				setError('Credenciais inválidas');
				return;
			}

			console.log(
				'✅ [LOGIN] Login bem-sucedido, verificando dados do usuário...'
			);

			// Agora buscar os dados do usuário
			try {
				const meRes = await fetch(`api/auth/me`, {
					credentials: 'include',
				});

				console.log(
					'📡 [LOGIN] Resposta do /auth/me após login:',
					meRes.status
				);

				if (meRes.ok) {
					const meData = await meRes.json();
					console.log('👤 [LOGIN] Dados do usuário:', meData.data);

					// Salvar no localStorage
					localStorage.setItem('user_id', meData.data.id);
					localStorage.setItem('user_role', meData.data.role);

					console.log('🎯 [LOGIN] Redirecionando para /chamados');
					router.push('/chamados');
				} else {
					console.log(
						'❌ [LOGIN] Falha ao buscar dados do usuário após login'
					);
					setError('Erro ao obter dados do usuário');
				}
			} catch (meError) {
				console.error(
					'💥 [LOGIN] Erro ao buscar dados do usuário:',
					meError
				);
				setError('Erro ao verificar autenticação');
			}
		} catch (error) {
			console.error('💥 [LOGIN] Erro no login:', error);
			setError('Erro de conexão. Tente novamente.');
		}
	};

	// Loading enquanto verifica autenticação inicial
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
					<h2 className="text-2xl font-bold text-gray-200 mb-4">
						{resetMode ? 'Recuperar Senha' : 'Bem vindo'}
					</h2>

					<form
						className={`flex flex-col ${
							resetMode ? 'hidden' : 'flex'
						}`}
						onSubmit={handleLogin}
					>
						<input
							placeholder="Usuário"
							className="bg-gray-600/80 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
							type="email"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
						<input
							placeholder="Senha"
							className="bg-gray-600/80 text-white border-0 rounded-md p-2 mb-2 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>

						<div className="flex justify-start p-1 ">
							<button
								type="button"
								onClick={() => setResetMode(true)}
								className="text-sm text-white cursor-pointer hover:text-red-700 font-semibold"
							>
								Esqueceu a senha?
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

					<form
						className={`flex flex-col ${
							resetMode ? 'flex' : 'hidden'
						}`}
					>
						<div className="flex flex-col">
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
						</div>

						<div className="hidden">
							<h1 className="text-white">
								<b className="text-red-600 font-semibold">
									E-mail enviado!{' '}
								</b>
								Verifique sua caixa de entrada para redefinir
								sua senha.
							</h1>
						</div>

						<div className="flex justify-center pt-5">
							<button
								type="button"
								onClick={() => setResetMode(false)}
								className="text-sm text-white cursor-pointer hover:text-red-700 font-semibold"
							>
								Voltar ao login
							</button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}
