// Sidebar.jsx
'use client'
import { Boxes, ChartPie, Headset, Power } from "lucide-react"

export default function Sidebar({ onSelect }) {
    return (
        <aside
            className="
                fixed top-16 left-0
                bg-zinc-900
                w-60
                h-[calc(100vh-4rem)]
                flex flex-col items-center justify-between
                text-white
            "
        >
           
            <div className="flex flex-col items-center w-full h-full">
                 {/* Logo */}
                <div className="flex items-center justify-center w-full h-2/12">
                    <img src="/img/global/logo_branco.svg" className="h-11" alt="Logo" />
                </div>

                {/* Botões */}
                <nav className="
                    flex min-w-[240px] flex-col gap-1 p-2
                    font-sans text-base font-normal
                    justify-center items-center
                    h-8/12
                ">
                    <button
                        type="button"
                        onClick={() => onSelect(1)}
                        className="cursor-pointer flex items-center w-full p-3 rounded-lg hover:bg-zinc-800 transition"
                    >
                        <div className="grid mr-4 place-items-center">
                            <Headset />
                        </div>
                        Solicitar Chamado
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelect(2)}
                        className="cursor-pointer flex items-center w-full p-3 rounded-lg hover:bg-zinc-800 transition"
                    >
                        <div className="grid mr-4 place-items-center">
                            <ChartPie />
                        </div>
                        Status do Chamado
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelect(3)}
                        className="cursor-pointer flex items-center w-full p-3 rounded-lg hover:bg-zinc-800 transition"
                    >
                        <div className="grid mr-4 place-items-center">
                            <Boxes />
                        </div>
                        Atribuir Chamado
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer flex items-center w-full p-3 rounded-lg hover:bg-zinc-800 transition"
                    >
                        <div className="grid mr-4 place-items-center">
                            <Power />
                        </div>
                        Sair
                    </button>
                </nav>
            </div>
        </aside>
    )
}
