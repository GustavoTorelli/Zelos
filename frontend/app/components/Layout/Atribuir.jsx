'use client'
import { useState } from 'react';
import { ChevronsRight, Goal, CirclePlay, BadgeCheck } from "lucide-react"
import StatusModal from "../Modals/StatusModal"
export default function Atribuir() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="md:w-screen h-full flex flex-col items-center pt-20 ">
            {/* modal */}
            <StatusModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* Titulo*/}
            <div className="mb-8 flex justify-between w-10/12   ">
                <div>
                    <h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
                        Atribuir chamado
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
            <section className="flex flex-col  w-10/12  items-start justify-center h-auto ">

                {/* quando não houver chamados */}
                <div className='hidden items-center justify-center w-full h-130  bg-[#1d1e21] rounded-xl gap-5 shadow-[-4px_8px_15px_-9px_rgba(0,_0,_0,_0.7)] '>
                    <BadgeCheck size={180} color='#B91C1C' />
                    <h1 className='text-3xl text-white font-semibold h-1'>Você não solicitou nenhum chamado.</h1>
                </div>

                {/* Chamado individual */}
                <div className="flex flex-col w-[200px] h-[100px] bg-[#1d1e21] rounded-xl shadow-[-4px_8px_15px_-9px_rgba(0,_0,_0,_0.7)] p-3 m-2">
                    {/* Cabeçalho do card */}
                    <div className="flex items-center justify-between w-full h-full">
                        {/* Dados básicos */}
                        <div className="flex flex-col justify-between w-[75%]">
                            {/* ID e Status */}
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xs font-medium text-gray-200 flex">
                                    #<span>55</span>
                                </h1>
                                <div className="w-0.5 h-6 bg-green-500"></div>
                            </div>

                            {/* Nome e ID do patrimônio */}
                            <div className="flex flex-col gap-1">
                                <span className="text-2xs font-medium text-gray-200 truncate uppercase">
                                    Nome do patrimônio
                                </span>
                                <h1 className="text-2xs font-medium text-gray-200 flex gap-1">
                                    ID: <span>2</span>
                                </h1>
                            </div>
                        </div>

                        {/* Botão */}
                        <div className="flex justify-center items-center w-[25%]">
                            <button
                                type="button"
                                aria-label="Botão"
                                className="cursor-pointer bg-gray-300 dark:bg-gray-200 w-8 h-8 rounded-full flex justify-center items-center hover:ring-2 ring-gray-200 dark:ring-gray-600 transition duration-200 ease-in-out"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </section>
        </section>
    )
}