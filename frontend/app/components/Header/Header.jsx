'use client'
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    if (pathname === '/') return null;

    return (
        <header className="
            fixed top-0 left-0 z-50
            w-full h-16
            bg-zinc-900
            flex items-center justify-end
            px-6
        ">
            {/* Conteúdo do header aqui */}
        </header>
    );
}