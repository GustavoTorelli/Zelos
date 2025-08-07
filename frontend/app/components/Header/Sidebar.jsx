'use client'
import { Boxes, ChartPie, Headset, Power } from "lucide-react"

export default function Sidebar() {
    return (
        <aside className="bg-zinc-900 h-12/12 w-2/12 flex flex-col items-center justify-center sticky">
            <div className=" flex items-center justify-center w-full ">
                <img src="/img/global/logo_branco.svg" className="h-11 " alt="Logo" />
            </div>

            <div className=" w-12/12 h-10/12 flex flex-col items-center justify-center">
                <nav className="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700 text-white justify-center items-center">
                    <button  type="button"
                        className=" cursor-pointer flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:text-red-800">
                        <div className="grid mr-4 place-items-center">
                            <Headset/>
                        </div>
                        Solicitar Chamado
                    </button>

                    <button  type="button"
                        className=" cursor-pointer flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:text-red-800">
                        <div className="grid mr-4 place-items-center">
                            <ChartPie/>
                        </div>
                        Status do Chamado
                    </button>

                    
                    <button  type="button"
                        className=" cursor-pointer flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:text-red-800">
                        <div className="grid mr-4 place-items-center">
                            <Boxes/>
                        </div>
                        Atribuir Chamado
                    </button>
                   
                    <button  type="button"
                        className=" cursor-pointer flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:text-red-800">
                        <div className="grid mr-4 place-items-center">
                            <Power/>
                        </div>
                        Sair
                    </button>
                </nav>
            </div>
        </aside>
    )
}