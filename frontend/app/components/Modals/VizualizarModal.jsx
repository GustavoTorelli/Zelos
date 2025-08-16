'use client';
import { useState } from "react";
import { CirclePlay, Goal } from "lucide-react";

export default function VizualizarModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [tecnico, setTecnico] = useState("Técnico 1"); // Valor padrão
    const [apontamentos, setApontamentos] = useState(
        "Exemplo de apontamento técnico..."
        
    );

    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center bg-zinc-950/70 bg-opacity-50"
        >
            <div className="relative w-full flex flex-col max-w-2xl h-auto p-6 bg-[#1d1e21] border border-zinc-600/95 rounded-lg space-y-4 shadow-lg">

                {/* Nome do Técnico */}
                <div className="pb-2 border-b border-zinc-600/95 rounded-t text-xl font-semibold text-white flex justify-between gap-2 mt-2 w-full">
                    <div className="flex gap-2">
                        <h3>Apontamentos Técnicos -</h3>
                        <span>#ID</span>
                    </div>
                    <div className="flex justify-center items-center text-center gap-2">
                        <CirclePlay color="#ed8936" />
                        <span className="text-xl font-semibold text-gray-100">dd/mm/aaaa</span>
                        <Goal color="#22c55e" />
                        <span className="text-xl font-semibold text-gray-100">dd/mm/aaaa</span>
                    </div>
                </div>

                {/* apontamento final */}
                <div className="text-gray-200 text-justify p-2">
                    <h1 className="gap-2 font-semibold">
                        Técnico: <span>{tecnico}</span>
                        </h1>
                    {apontamentos}
                </div>

                {/* Botão de Ok */}
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-2 px-6 rounded-md hover:from-red-800 hover:to-red-700 transition ease-in-out duration-150 cursor-pointer"
                    >
                        Ok
                    </button>
                </div>
            </div>
        </div>
    );
}
