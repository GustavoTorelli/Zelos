'use client'
import { usePathname } from "next/navigation";
// import { Wrench, Camera } from 'lucide-react';

export default function Header() {
    const pathname = usePathname()

    if (pathname === '/') {
        return null;
    }

    return (
        <header className="flex flex-col bg-zinc-900 w-full h-15 fixed top-0">

            
        </header>
    )
}