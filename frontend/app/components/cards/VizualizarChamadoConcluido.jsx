import { useState } from 'react';
import VizualizarModal from '../Modals/VizualizarModal';
export default function VizualizarChamado() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="w-72 h-48 flex flex-col justify-between bg-[#1d1e21] rounded-xl shadow-[-4px_8px_15px_-9px_rgba(0,0,0,0.7)] p-5 m-2">
            {/* modal */}
            <VizualizarModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* Conteúdo principal */}
            <div className="flex flex-col h-full gap-2">
                {/* chamado id*/}
                <div className="flex flex-col gap-2">
                    <div className="w-full h-1 bg-[#22C55E] rounded-full"></div>
                    <h1 className="text-sm font-semibold text-gray-100 tracking-wide">
                        Chamado <span className="text-[#22C55E]">#1234567</span>
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
            <button
                onClick={() => setIsOpen(true)}
                className="mt-3 bg-gradient-to-r from-green-700 to-green-600 text-white font-bold py-2 px-4 rounded-md hover:from-green-800 hover:to-green-800 transition ease-in-out duration-150 cursor-pointer w-full"
            >
                Vizualizar
            </button>
        </div>
    )
}