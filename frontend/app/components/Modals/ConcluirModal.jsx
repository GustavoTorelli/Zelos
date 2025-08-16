'use client';
import { useState } from "react";
import { CirclePlay, Goal } from "lucide-react";

export default function ConcluirModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [tecnico, setTecnico] = useState("");
    const [apontamentos, setApontamentos] = useState("");
   

    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex justify-center items-center bg-zinc-950/70 bg-opacity-50"
        >
            <div className="relative w-full flex flex-col max-w-3xl h-auto p-6 bg-[#1d1e21] border border-zinc-600/95 rounded-lg space-y-4 shadow-lg">

                {/* Header */}
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

                {/* Formulário */}
                <form
                    className="flex flex-col w-full items-center justify-center gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        alert(
                            `Dados preenchidos (teste):\nTécnico: ${tecnico}\nApontamentos: ${apontamentos}`
                        );
                        onClose();
                    }}
                >
                    {/* Nome do Técnico */}
                    <select
                        value={tecnico}
                        onChange={(e) => setTecnico(e.target.value)}
                        className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                    >
                        <option value="">Nome do técnico</option>
                        <option value="tecnico1">Técnico 1</option>
                        <option value="tecnico2">Técnico 2</option>
                        <option value="tecnico3">Técnico 3</option>
                    </select>

                    {/* Textarea Apontamentos */}
                    <textarea
                        value={apontamentos}
                        onChange={(e) => setApontamentos(e.target.value)}
                        className="bg-gray-600/80 w-full h-40 resize-none text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                        placeholder="Escreva os apontamentos técnicos aqui..."
                        maxLength={300}
                    ></textarea>

                    {/* Botões */}
                    <div className="w-full flex gap-3 mt-4">
                        {/* Concluir */}
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-green-700 to-green-600 text-white font-bold py-2 px-4 rounded-md hover:from-green-800 hover:to-green-800 transition ease-in-out duration-150 cursor-pointer w-full"
                        >
                            Concluir
                        </button>

                        {/* Atualizar */}
                        <button
                            type="button"
                            onClick={() => alert("Chamado atualizado (teste)")}
                            className="bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold py-2 px-4 rounded-md hover:from-blue-800 hover:to-blue-700 transition ease-in-out duration-150 cursor-pointer w-full"
                        >
                            Atualizar
                        </button>

                        {/* Excluir */}
                        <button
                            type="button"
                            onClick={() => alert("Chamado excluído (teste)")}
                            className="bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-2 px-4 rounded-md hover:from-red-800 hover:to-red-700 transition ease-in-out duration-150 cursor-pointer w-full"
                        >
                            Excluir
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
