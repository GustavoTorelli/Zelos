'use client';
import {
	Boxes,
	ChartNoAxesCombined,
	Database,
	Headset,
	Power,
	Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Sidebar({ onSelect, isOpen }) {
	const router = useRouter();

	async function handleLogout() {
		try {
			const res = await fetch('/api/auth/logout', {
				method: 'POST',
				credentials: 'include',
			});

			if (res.ok) {
				localStorage.removeItem('user_id');
				localStorage.removeItem('user_role');
				router.push('/');
			} else {
				console.error('Logout failed');
			}
		} catch (err) {
			console.error('Error logging out:', err);
		}
	}

	return (
		<aside
			className={`fixed top-16 left-0 z-40
                bg-zinc-900 w-60 h-[calc(100vh-4rem)]
                flex flex-col items-center justify-between
                text-white transition-transform duration-300 ease-in-out
                md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
		>
			<div className="flex flex-col items-center w-full h-full">
				{/* Logo */}
				<div className="hidden md:flex items-center justify-center w-full h-2/12">
					<img src="/img/global/logo_branco.svg" className="h-11" alt="Logo" />
				</div>

				{/* Buttons */}
				<nav className="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal justify-center items-center h-12/12 md:h-8/12">


					<button
						type="button"
						onClick={() => onSelect(1)}
						className="cursor-pointer flex items-center w-full p-3 rounded-lg hover:bg-zinc-800 transition"
					>
						<div className="grid mr-4 place-items-center">
							<Headset />
						</div>
						Gestão de Chamados
					</button>

					<button
						type="button"
						onClick={() => onSelect(2)}
						className="cursor-pointer flex items-center w-full p-3 rounded-lg hover:bg-zinc-800 transition"
					>
						<div className="grid mr-4 place-items-center">
							<Database/>
						</div>
						Gestão de Dados
					</button>

					<button
						type="button"
						onClick={() => onSelect(3)}
						className="cursor-pointer flex items-center w-full p-3 rounded-lg hover:bg-zinc-800 transition"
					>
						<div className="grid mr-4 place-items-center">
							<ChartNoAxesCombined />
						</div>
						Gerar Relatório
					</button>

					<button
						type="button"
						onClick={handleLogout}
						className="cursor-pointer flex items-center w-full p-3 rounded-lg hover:bg-zinc-800 transition"
					>
						<div className="grid mr-4 place-items-center">
							<Power />
						</div>
						Sair
					</button>
				</nav>
			</div>
		</aside>
	);
}
