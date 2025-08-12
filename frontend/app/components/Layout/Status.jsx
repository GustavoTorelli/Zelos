'use client'
import { useState } from 'react';
import { ChevronsRight } from "lucide-react"
import StatusModal from "../Modals/StatusModal"
export default function Status() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="md:w-300 h-full">
            {/* modal */}
            <StatusModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
            {/* Titulo*/}
            <div className="mb-8">
                <h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
                    Status do Chamado
                </h1>
                <div className="w-24 h-1 bg-red-700 rounded"></div>
            </div>
            {/* seção dos chamdos */}
            <div className="flex flex-wrap w-auto items-center justify-center">
                
                {/* quando não houver chamados */}
                <div className='w-full h-full hidden flex-col justify-center items-center text-gray-100 font-semibold text-2xl '>
                    <img className='h-80 mt-16' src="/img/status/statusNulo.svg" alt="nenhum chamado" />
                    <h1>Você não solicitou nenhum chamado!</h1>
                </div>

                {/* chamado individual */}
                <div className="w-full min-h-[60px] rounded-[20px] flex items-center justify-between hover:shadow-lg dark:bg-gray-600/80 dark:text-white m-0.5 px-6 py-3 transition-all duration-300">
                    {/* Esquerda */}
                    <div className="flex items-center gap-6">
                        {/* ID */}
                        <span className="text-lg font-semibold roboto-mono-500 text-gray-800 dark:text-white">
                            #ID
                        </span>

                        {/*status*/}
                        <span className="flex items-center text-sm font-medium text-gray-800 dark:text-white ">
                            <span className="flex w-3.5 h-3.5 bg-orange-500 rounded-full me-2 shrink-0"></span>
                            Em andamento...
                        </span>

                        {/* <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            <span className="flex w-3.5 h-3.5 bg-green-500 rounded-full me-2 shrink-0"></span>
                            Concluido!
                        </span> */}
                    </div>

                    {/* Centro - Título com estado */}
                    <div className="flex items-center gap-2 text-base font-medium text-gray-800 dark:text-white truncate max-w-[50%]">
                        <span className="text-gray-600 dark:text-gray-300">Patrimônio:</span>
                        <span className="text-white dark:text-gray-100">Nome do patrimonio</span>
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