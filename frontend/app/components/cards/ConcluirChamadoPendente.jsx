import { useState } from 'react';
import ConcluirModal from "../Modals/ConcluirModal"
import { ChevronsRight } from 'lucide-react';
export default function ConcluirChamado() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="w-72 h-48 flex flex-col justify-between bg-[#1d1e21] rounded-xl shadow-[-4px_8px_15px_-9px_rgba(0,0,0,0.7)] p-5 m-2">
            {/* modal */}
            <ConcluirModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* Conteúdo principal */}
            <div className="flex flex-col h-full gap-2">
                {/* chamado id*/}
                <div className="flex flex-col gap-2">
                    <div className="w-full h-1 bg-[#F59E0B] rounded-full"></div>
                    <h1 className="text-sm font-semibold text-gray-100 tracking-wide">
                        Chamado <span className="text-[#F59E0B]">#1234567</span>
                    </h1>
                </div>

                {/* Informações */}
                <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-400 uppercase">
                        Patrimônio
                    </span>
                    <span className="text-sm font-medium text-gray-200 truncate">
                        Nome do patrimônio
                    </span>
                    <span className="text-xs text-gray-300">
                        ID: <span className="font-medium">1234567</span>
                    </span>
                </div>
            </div>

            {/* Botão */}
            <div className="flex justify-end mt-3">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-red-700 to-red-600 text-white py-2 px-4 rounded-md hover:from-red-800 hover:to-red-700 transition duration-150 flex justify-center items-center gap-1 cursor-pointer"

                >
                    Concluir

                    <ChevronsRight />
                </button>
            </div>
        </div>
    )
}