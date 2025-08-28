'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
};

function translateError(message) {
	if (!message) return 'Ocorreu um erro inesperado. Tente novamente.';
	return (
		ERROR_MAP[message] ||
		message ||
		'Ocorreu um erro inesperado. Tente novamente.'
	);
}

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams ? searchParams.get('token') : null;

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!token) {
			setError(
				'Token não fornecido. Verifique o link enviado por e-mail.'
			);
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccessMessage('');

		if (!token) {
			setError('Token ausente. Não é possível redefinir a senha.');
			return;
		}

		if (password.length < 8) {
			setError('Senha deve ter pelo menos 8 caracteres.');
			return;
		}

		if (password !== confirmPassword) {
			setError('As senhas não coincidem.');
			return;
		}

		setIsSubmitting(true);
		try {
			const localToken =
				typeof window !== 'undefined'
					? localStorage.getItem('token')
					: null;
			const headers = { 'Content-Type': 'application/json' };
			if (localToken) headers.Authorization = `Bearer ${localToken}`;

			const url = `/api/auth/reset-password?token=${encodeURIComponent(
				token
			)}`;
			const res = await fetch(url, {
				method: 'POST',
				headers,
				body: JSON.stringify({ password }),
			});

			const body = await res.json().catch(() => ({}));

			if (!res.ok || body.success === false) {
				const friendly = translateError(body.message);
				setError(friendly);
				return;
			}

			setSuccessMessage(
				'Senha redefinida com sucesso. Redirecionando para o login...'
			);

			// Redireciona após 2 segundos para que o usuário veja a confirmação
			setTimeout(() => router.push('/login'), 2000);
		} catch (err) {
			setError('Erro de conexão. Tente novamente.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="w-screen h-screen flex flex-col items-center md:justify-center md:bg-[url('/img/global/senai.png')] md:bg-cover bg-black ">
			<div className="flex flex-col md:items-center md:justify-center h-screen md:w-200 w-80 items-center justify-evenly">
				<div className="w-full max-w-md bg-zinc-900/70 rounded-xl shadow-lg p-8 py-10">
					<h2 className="text-2xl font-bold text-gray-200 mb-6">
						Redefinir Senha
					</h2>

					{error && <InputError message={error} />}
					{successMessage && (
						<p className="text-green-400 mb-4 text-sm text-center">
							{successMessage}
						</p>
					)}

					<form className="flex flex-col" onSubmit={handleSubmit}>
						<div className="relative mb-4">
							<input
								placeholder="Nova senha"
								className="bg-gray-600/80 text-white border-0 rounded-md p-2 pr-10 w-full focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={8}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-150"
								aria-label="Alternar visibilidade da senha"
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

						<input
							placeholder="Confirme a nova senha"
							className="bg-gray-600/80 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
							type={showPassword ? 'text' : 'password'}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							minLength={8}
						/>

						<button
							type="submit"
							disabled={isSubmitting}
							className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-2 hover:from-red-900 hover:to-red-800 transition ease-in-out duration-150 cursor-pointer disabled:opacity-50"
						>
							{isSubmitting
								? 'Redefinindo...'
								: 'Redefinir senha'}
						</button>

						<div className="flex justify-center pt-5">
							<button
								type="button"
								onClick={() => router.push('/login')}
								className="relative text-sm text-white/70 cursor-pointer hover:text-white font-semibold transition-colors duration-300 group"
							>
								Voltar ao login
								<span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-red-700 transition-all duration-300 group-hover:w-full"></span>
							</button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}
