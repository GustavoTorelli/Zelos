'use client'
import { useState } from 'react';
import { ChevronsRight, Goal, CirclePlay, BadgeCheck} from "lucide-react"
import StatusModal from "../Modals/StatusModal"
export default function Status() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="w-full h-full ">
            {/* modal */}
            <StatusModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* Titulo*/}
            <div className="mb-8 flex justify-between">
                <div>
                    <h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
                        Status do Chamado
                    </h1>
                    <div className="w-24 h-1 bg-red-700 rounded"></div>
                </div>

                {/* botão para filtrar status */}
                <button type="button" className='flex'>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input className="sr-only peer" value="button" type="checkbox"></input>
                        <div className=" flex items-center justify-around peer rounded-[100px] outline-none duration-100 after:duration-500 w-20 h-10 bg-orange-500 after:content-[''] after:absolute after:outline-none after:rounded-full after:h-8 after:w-8 text-white after:border-zinc-800 after:dark:bg-white after:border-3 after:top-2 after:left-1 after:flex after:justify-between after:items-center peer-checked:bg-green-500 peer-checked:after:translate-x-10 peer-checked:after:content-[''] ">
                            <CirclePlay size={25} />
                            <Goal size={25} />
                        </div>

                    </label>
                </button>
            </div>

            {/* seção dos chamados */}
            <section className="flex flex-wrap  w-300 h-auto items-start justify-center ">

                {/* quando não houver chamados */}
                <div className='hidden items-center justify-center w-full h-130  bg-[#1d1e21] rounded-xl gap-2 shadow-[-4px_8px_15px_-9px_rgba(0,_0,_0,_0.7)] '>
                    <BadgeCheck size={180} color='#B91C1C' />
                    <h1 className='text-3xl text-white font-semibold h-1'>Você não solicitou nenhum chamado.</h1>
                </div>

                {/* Chamado individual */}
                <div className="flex items-center justify-between w-full h-20  bg-[#1d1e21] rounded-xl gap-2 shadow-[-4px_8px_15px_-9px_rgba(0,_0,_0,_0.7)] m-2">
                    {/* dados */}
                    <div className='w-[90%] h-full flex items-center justify-start gap-2'>

                        {/* id e status */}
                        <div className='mx-5 h-full flex justify-center items-center gap-5'>
                            {/* id do chamado */}
                            <h1 className='text-2xs font-medium text-gray-200 flex '>
                                #
                                <span className="text-2xs font-medium text-gray-200">
                                    1
                                </span>
                            </h1>

                            {/* status em andamento */}
                            <div className="w-1 h-4/5 bg-orange-500 hidden"></div>
                            {/* status concluido */}
                            <div className="w-1 h-4/5 bg-green-500 "></div>

                        </div>

                        {/* Nome do patrimônio */}
                        <span className="text-2xs font-medium text-gray-200 truncate uppercase">
                            Nome do patrimônio
                        </span>

                        {/* ID do patrimonio */}
                        <h1 className='text-2xs font-medium text-gray-200 flex gap-1'>
                            ID:
                            <span className="text-2xs font-medium text-gray-200">
                                2
                            </span>
                        </h1>
                    </div>

                    {/* botão do modal de apontamentos */}
                    <div className='w-[10%] h-full flex items-center justify-center'>
                        <button
                            onClick={() => setIsOpen(true)}
                            type="button"
                            aria-label="Ver detalhes do chamado"
                            className="cursor-pointer bg-gray-300 dark:bg-gray-200 w-10 h-10 rounded-full flex justify-center items-center hover:ring-4 ring-gray-200 dark:ring-gray-600 transition duration-300 ease-in-out"
                        >
                            <ChevronsRight />
                        </button>
                    </div>

                </div>

            </section>
        </section>
    )
}