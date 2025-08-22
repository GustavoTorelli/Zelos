'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Header/Sidebar';
import Relatorio from '@/app/components/Layout/Report';
import TicketsPage from '@/app/components/Layout/Tickets';
import Header from '@/app/components/Header/Header';
import UsersPage from '@/app/components/Layout/Users';

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
			console.log('🔍 Verificando autenticação...');

			try {
				// Verificar se está no cliente
				if (typeof window === 'undefined') {
					setIsLoading(false);
					return;
				}

				const id = localStorage.getItem('user_id');
				const role = localStorage.getItem('user_role');

				console.log(' Dados de autenticação:', {
					id: !!id,
					role: role,
					hasId: !!id,
					hasRole: !!role,
				});

				// Verificar se AMBOS existem E não são strings vazias
				if (id && role && id.trim() !== '' && role.trim() !== '') {
					console.log('✅ Usuário autenticado');
					setIsAuthenticated(true);
				} else {
					console.log(
						'❌ Dados de autenticação inválidos ou ausentes'
					);
					console.log(' ID:', id);
					console.log(' Role:', role);

					// Apenas redirecionar, SEM fazer logout no backend
					// (o usuário pode não estar logado mesmo)
					localStorage.removeItem('user_id');
					localStorage.removeItem('user_role');
					router.push('/');
					return;
				}
			} catch (error) {
				console.error(' Erro na verificação de autenticação:', error);
				router.push('/');
			} finally {
				setIsLoading(false);
			}
		};

		// Executar verificação apenas uma vez
		checkAuth();
	}, []); // ⚠️ IMPORTANTE: Array vazio para executar apenas uma vez

	// Debug: monitorar mudanças de estado
	useEffect(() => {
		console.log('📈 Estado atual:', { isLoading, isAuthenticated });
	}, [isLoading, isAuthenticated]);

	// Loading state
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

	// Not authenticated state
	if (!isAuthenticated) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-gray-600">Redirecionando para login...</p>
			</div>
		);
	}

	// Authenticated - render main content
	return (
		<div className="flex flex-col h-screen">
			{/* Header com função de logout disponível */}
			<Header toggleSidebar={toggleSidebar}  />

			{/* Conteúdo com Sidebar */}
			<div className="flex flex-1 pt-16">
				<Sidebar onSelect={setActiveComponent} isOpen={sidebarOpen} />
				<section className="flex w-full overflow-y-auto p-6 bg-zinc-100 dark:bg-zinc-800 justify-center items-center md:ml-60">
					{activeComponent === 1 && <TicketsPage/> }
					{activeComponent === 2 && <UsersPage/>}
					{activeComponent === 3 && <Relatorio />}
				</section>
			</div>
		</div>
	);
}
