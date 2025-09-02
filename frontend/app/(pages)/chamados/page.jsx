'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Header/Sidebar';
import Relatorio from '@/app/components/Layout/Report';
import TicketsPage from '@/app/components/Layout/Tickets';
import Header from '@/app/components/Header/Header';
import AdminPage from '@/app/components/Layout/Admin';

export default function Chamados() {
	const router = useRouter();
	const [activeComponent, setActiveComponent] = useState(1);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	useEffect(() => {
		const checkAuth = async () => {
			try {
				if (typeof window === 'undefined') {
					setIsLoading(false);
					return;
				}

				const id = localStorage.getItem('user_id');
				const role = localStorage.getItem('user_role');

				// Verificar se dados locais existem
				if (!id || !role || id.trim() === '' || role.trim() === '') {
					localStorage.removeItem('user_id');
					localStorage.removeItem('user_role');
					router.push('/');
					return;
				}

				const token = localStorage.getItem('token');

				if (!token) {
					localStorage.removeItem('user_id');
					localStorage.removeItem('user_role');
					localStorage.removeItem('token');
					router.push('/');
					return;
				}

				const response = await fetch('/api/auth/me', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const result = await response.json();
					const userData = result.data;

					if (
						userData.id.toString() === id &&
						userData.role === role
					) {
						setIsAuthenticated(true);
					} else {
						localStorage.removeItem('user_id');
						localStorage.removeItem('user_role');
						localStorage.removeItem('token');
						router.push('/');
					}
				} else {
					localStorage.removeItem('user_id');
					localStorage.removeItem('user_role');
					localStorage.removeItem('token');
					router.push('/');
				}
			} catch (error) {
				localStorage.removeItem('user_id');
				localStorage.removeItem('user_role');
				localStorage.removeItem('token');
				router.push('/');
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, [router]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-700"></div>
				<p className="ml-4 text-gray-600">
					Verificando autenticação...
				</p>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-gray-600">Redirecionando para login...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen">
			<Header toggleSidebar={toggleSidebar} />
			<div className="flex flex-1 pt-16">
				<Sidebar onSelect={setActiveComponent} isOpen={sidebarOpen} />
				<section className="flex w-full overflow-y-auto p-6 bg-zinc-100 dark:bg-zinc-800 justify-center items-center md:ml-60">
					{activeComponent === 1 && <TicketsPage />}
					{activeComponent === 2 && <AdminPage />}
					{activeComponent === 3 && <Relatorio />}
				</section>
			</div>
		</div>
	);
}
