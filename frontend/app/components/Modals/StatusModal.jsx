'use client';
import {CirclePlay, Goal} from "lucide-react"
export default function StatusModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center bg-zinc-950/70 bg-opacity-50"
        >
            <div className="relative w-full flex flex-col max-w-3xl h-[420px] p-6 dark:bg-zinc-700 border border-zinc-600/95 rounded-lg space-y-4 shadow ">
                {/* Header */}
                <div className=" pb-2 border-b border-zinc-600/95 rounded-t text-xl font-semibold text-white flex justify-between gap-2 mt-5 w-full">
                    <div className="flex gap-2">
                        <h3 className="">
                            Apontamentos Técnicos -
                        </h3>
                        <span>#ID</span>
                    </div>
                    <div className="flex justify-center items-center text-center gap-2">
                        {/* Inicio */}
                        <CirclePlay color="#ed8936"/>
                        <span className="text-xl  font-semibold text-gray-100">dd/mm/aaaa</span>
                        {/* Fim  */}
                        <Goal color="#22c55e"/>
                        <span className="text-xl  font-semibold text-gray-100">dd/mm/aaaa</span>
                    </div>

                </div>

                <div className="flex flex-col justify-between w-full h-full">
                    {/* Apontamentos detalhados */}
                    <div className="text-gray-200 text-justify p-2">
                        <p className="text-xl hidden">
                            Apontamentos detalhados...
                        </p>
                        {/* sem apontamentos */}
                        <p className="text-xl ">
                            Nenhum Apontamento.
                        </p>
                    </div>

                    {/* Botão de encerramento */}
                    <div className="flex items-center justify-start pt-4  space-x-3">
                        <button
                            onClick={onClose}
                            className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md  hover:from-red-900 hover:to-red-900 transition ease-in-out duration-150 cursor-pointer w-full "
                        >
                            Ok
                        </button>
                    </div>
                </div>


            </div>
        </div>

    );
}
