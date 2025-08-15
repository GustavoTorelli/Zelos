'use client'
import { useState } from 'react';
import { ChevronsRight, Goal, CirclePlay, BadgeCheck } from "lucide-react"
import StatusModal from "../Modals/StatusModal"
import AtribuirButton from '../button/AtribuirButton';
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
                <AtribuirButton />
            </div>

            {/* seção dos chamados */}
            <section className="flex flex-wrap   w-10/12  items-start  h-auto ">

                {/* quando não houver chamados */}
                <div className='hidden items-center justify-center w-full h-130  bg-[#1d1e21] rounded-xl gap-5 shadow-[-4px_8px_15px_-9px_rgba(0,_0,_0,_0.7)] '>
                    <BadgeCheck size={180} color='#B91C1C' />
                    <h1 className='text-3xl text-white font-semibold h-1'>Você não solicitou nenhum chamado.</h1>
                </div>

                {/* card de atribuir chamado */}
                <div className="w-72 h-40 flex flex-col justify-between bg-[#1d1e21] rounded-xl shadow-[-4px_8px_15px_-9px_rgba(0,0,0,0.7)] p-5 m-2">
                    {/* Conteúdo principal */}
                    <div className="flex flex-col h-full ">
                        {/* Status e ID */}
                        <div className="flex flex-col  gap-2 w-full flex-shrink-0">
                            <div className="w-full h-1 bg-green-500 rounded-full"></div>
                            <h1 className="text-2xs font-medium text-gray-200">
                                #<span>1</span>
                            </h1>
                        </div>

                        {/* Informações do patrimônio */}
                        <div className="flex flex-col justify-between min-w-0">
                            <span className="text-2xs font-medium text-gray-200 truncate uppercase">
                                Nome do patrimônio
                            </span>
                            <h1 className="text-2xs font-medium text-gray-200 gap-1 flex">
                                ID: <span>1234567</span>
                            </h1>
                        </div>
                    </div>

                    {/* Botão */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="mt-2 bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md  hover:from-red-900 hover:to-red-900 transition ease-in-out duration-150 cursor-pointer w-full "
                    >
                        Ver Detalhes
                    </button>
                </div>
            </section>
        </section>
    )
}