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
            {/* botão celular*/}
            <button
                onClick={toggleSidebar}
                className="text-white md:hidden cursor-pointer rounded-md hover:bg-zinc-500/20 p-2 transition-colors"
                aria-label="Toggle menu"
            >
                <Menu size={24} />
            </button>
        </header>
    )
}