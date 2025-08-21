'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
	const router = useRouter();

	useEffect(() => {
		const user = {
			id: localStorage.getItem('user_id'),
			role: localStorage.getItem('user_role'),
		};
		if (user.id && user.role) {
			router.push('/chamados');
		} else {
			router.push('/login');
		}
	}, [router]);

	return null; // não renderiza nada, só redireciona
}
