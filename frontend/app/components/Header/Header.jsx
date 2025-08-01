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
            <nav className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className=" flex flex-wrap items-center mx-auto p-4">
                    <a href="#" className="flex items-center  ">
                        <img src="/img/logo_branco.svg" className="h-10" alt="Logo" />
                    </a>
                </div>
            </nav>
        </header>
    )


}