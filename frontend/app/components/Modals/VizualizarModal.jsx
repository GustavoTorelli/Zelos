'use client';
import { useState } from "react";
import { CirclePlay, Goal } from "lucide-react";

export default function VizualizarModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [tecnico, setTecnico] = useState("Técnico 1");
    const [apontamentos, setApontamentos] = useState("Exemplo de apontamento técnico...");

    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center bg-zinc-950/70"
        >
            <div className="
                relative w-full max-w-lg sm:max-w-xl md:max-w-2xl
                mx-4
                flex flex-col
                max-h-[90vh] overflow-y-auto
                p-4 sm:p-6
                bg-[#1d1e21] border border-zinc-600/95 
                rounded-lg space-y-4 shadow-lg
            ">
                {/* Header */}
                <div className="pb-2 border-b border-zinc-600/95 rounded-t text-lg sm:text-xl font-semibold text-white flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
                    <div className="flex gap-2 justify-center items-center">
                        <h3>Apontamentos Técnicos -</h3>
                        <span>#ID</span>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-2">
                        <CirclePlay color="#ed8936" />
                        <span className="text-sm sm:text-lg font-semibold text-gray-100">dd/mm/aaaa</span>
                        <Goal color="#22c55e" />
                        <span className="text-sm sm:text-lg font-semibold text-gray-100">dd/mm/aaaa</span>
                    </div>
                </div>

                {/* Apontamento final */}
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
