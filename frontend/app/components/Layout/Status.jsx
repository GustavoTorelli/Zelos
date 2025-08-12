'use client'
import { useState } from 'react';
import { ChevronsRight, Goal, CirclePlay } from "lucide-react"
import StatusModal from "../Modals/StatusModal"
export default function Status() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="w-full h-full">
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
                        <div className=" flex items-center justify-around peer rounded-[100px] outline-none duration-100 after:duration-500 w-20 h-10 bg-orange-500 after:content-[''] after:absolute after:outline-none after:rounded-full after:h-8 after:w-8 text-white after:border-zinc-800 after:dark:bg-gray-500 after:border-3 after:top-2 after:left-1 after:flex after:justify-between after:items-center peer-checked:bg-green-500 peer-checked:after:translate-x-10 peer-checked:after:content-[''] ">
                            <CirclePlay size={25} />
                            <Goal size={25} />
                        </div>

                    </label>
                </button>
            </div>

            {/* seção dos chamados */}
            <div className="flex flex-wrap w-300 items-center justify-center">

                {/* quando não houver chamados */}
                <div className='w-full h-full hidden flex-col justify-center items-center text-gray-100 font-semibold text-2xl '>
                    <img className='h-80 mt-17' src="/img/status/statusNulo.svg" alt="nenhum chamado" />
                    <h1>Você não solicitou nenhum chamado!</h1>
                </div>

                {/* chamado individual */}
                <div className="w-full min-h-[60px] rounded-[10px] flex items-center justify-between hover:shadow-lg dark:bg-gray-600/80 dark:text-white m-2 px-6 py-3 transition-all duration-300">
                    {/* Esquerda */}
                    <div className="flex items-center gap-6">

                        {/* ID */}
                        <span className="text-lg font-semibold  text-gray-800 dark:text-white">
                            #ID
                        </span>

                        {/* Nome do patrimonio */}
                        <div className="flex items-center gap-2 text-base font-medium text-gray-800 dark:text-white truncate max-w-[50%] ">
                            <span className="text-white dark:text-gray-100">Nome do patrimonio</span>
                        </div>

                        {/*status*/}

                        {/* em andamento */}
                        <span className="flex items-center text-base font-medium text-gray-800 dark:text-white gap-2 ">
                            <span className="flex w-3.5 h-3.5 bg-orange-500 rounded-full  shrink-0"></span>
                   
                            Em andamento...
                        </span>

                        {/* concluido */}
                        {/* <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 gap-2">
                            <span className="flex w-3.5 h-3.5 bg-green-500 rounded-full shrink-0"></span>
                            Concluido!
                        </span> */}
                    </div>



                    {/* Direita */}
                    <button
                        onClick={() => setIsOpen(true)}
                        type="button"
                        aria-label="Ver detalhes do chamado"
                        className="cursor-pointer bg-gray-300 dark:bg-gray-500 w-10 h-10 rounded-full flex justify-center items-center hover:ring-4 ring-gray-200 dark:ring-gray-400 transition duration-300 ease-in-out"
                    >
                        <ChevronsRight />

                    </button>
                </div>

                
            </div>
        </section>

    )
}