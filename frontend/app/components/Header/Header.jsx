'use client'

import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname()

    if (pathname === '/') {
        return null;
    }
    return (
        <header className="bg-red-800 w-auto h-80"></header>
    )


}