'use client'
import { usePathname } from "next/navigation";
// import { Wrench, Camera } from 'lucide-react';

export default function Header() {
    const pathname = usePathname()

    if (pathname === '/') {
        return null;
    }

    return (
        <header className="flex flex-col">
            <nav className=" bg-zinc-900">
                <div className=" flex flex-wrap items-center mx-auto p-4">
                    <a href="#" className="flex items-center  ">
                        <img src="/img/global/logo_branco.svg" className="h-10" alt="Logo" />
                    </a>
                </div>
            </nav>
        </header>
    )
}