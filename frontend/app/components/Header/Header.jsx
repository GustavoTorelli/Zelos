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
            <nav >
                <div className=" flex flex-wrap items-center pt-5 pl-7">
                        <img src="/img/global/logo_branco.svg" className="h-11" alt="Logo" />
                </div>
            </nav>
        </header>
    )
}