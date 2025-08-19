import '@/public/css/globals.css'
import { CircleAlert, CircleCheck, X } from "lucide-react";

export default function ChamadoConcluido({ show, onClose, title, description }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0  z-50 flex justify-end items-start p-4 w-full ">
            <div className="flex flex-col gap-2 w-60 sm:w-72 text-[10px] sm:text-xs mt-10
                      bg-[#1d1e21] rounded-lg p-2 shadow-lg transform -translate-y-10 
                      opacity-0 animate-slideDown">
                <div className="flex items-center justify-between w-full h-12 sm:h-14">
                    <div className="flex gap-2">
                        <div className="text-green-600 bg-zinc-500/20 backdrop-blur-xl p-1 rounded-lg">
                            <CircleCheck/>
                        </div>
                        <div>
                            <p className="text-white">Chamado Concluido!</p>
                            <p className="text-gray-500">Você concluiu um chamado.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer text-gray-600 hover:bg-zinc-500/20 p-1 rounded-md transition-colors ease-linear"
                    >
                        <X/>
                    </button>
                </div>
            </div>
        </div>
    );
}
