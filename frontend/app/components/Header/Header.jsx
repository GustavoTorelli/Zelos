'use client'
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export default function Header({ toggleSidebar }) {
    const pathname = usePathname();

    if (pathname === '/') return null;

    return (
        <header className="
        fixed top-0 left-0 z-50
        w-full h-16
        bg-zinc-900
        flex items-center justify-between
        px-6
    ">
            {/* Botão mobile */}
            <button
                onClick={toggleSidebar}
                className="text-white md:hidden cursor-pointer rounded-md hover:bg-zinc-500/20 p-2 transition-colors"
                aria-label="Toggle menu"
            >
                <Menu size={24} />
            </button>

            {/* Logo */}
            <div className="md:hidden absolute left-1/2 transform -translate-x-1/2 md:static md:ml-0 flex items-center justify-center w-auto h-full">
                <img src="/img/global/logo_branco.svg" className="h-9" alt="Logo" />
            </div>

            {/* Logout */}
            <button
                onClick={async () => {
                    try {
                        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                    } catch (_) {}
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    window.location.href = '/';
                }}
                className="hidden md:inline-flex text-white cursor-pointer rounded-md hover:bg-zinc-500/20 px-3 py-2 transition-colors"
            >
                Sair
            </button>
        </header>
    )
}