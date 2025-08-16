'use client';
import { useState } from "react";
import { CirclePlay, Goal } from "lucide-react";

export default function StatusModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [nome, setNome] = useState("");
    const [patrimonioId, setPatrimonioId] = useState("");
    const [tipo, setTipo] = useState("");
    const [descricao, setDescricao] = useState("");

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

                {/* Formulário com os dados */}
                <form
                    className="flex flex-col w-full items-center justify-center gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        alert(
                            "Dados preenchidos (alert de teste):\n" +
                            `Nome: ${nome}\nID: ${patrimonioId}\nTipo: ${tipo}\nDescrição: ${descricao}`
                        );
                        onClose();
                    }}
                >
                    {/* Nome e ID */}
                    <div className="flex w-full gap-3">
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="bg-gray-600/80 w-1/2 text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                            placeholder="Nome do Patrimônio"
                            maxLength={80}
                        />

                        <input
                            type="text"
                            value={patrimonioId}
                            onChange={(e) => setPatrimonioId(e.target.value)}
                            className="bg-gray-600/80 w-1/2 text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                            placeholder="ID do Patrimônio"
                        />
                    </div>

                    {/* Tipo de Chamado */}
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90 mt-3"
                    >
                        <option value="">Tipo de Chamado</option>
                        <option value="manutencao">Manutenção</option>
                        <option value="apoio">Apoio Técnico</option>
                        <option value="outros">Outros</option>
                    </select>

                    {/* Descrição */}
                    <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="bg-gray-600/80 w-full h-40 resize-none text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90 mt-3"
                        placeholder="Descrição do Problema"
                        maxLength={200}
                    ></textarea>

                    {/* Atribuir Técnico */}
                    <select
                        className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90 mt-3"
                    >
                        <option value="">Atribuir Técnico</option>
                        <option value="tecnico1">Técnico 1</option>
                        <option value="tecnico2">Técnico 2</option>
                        <option value="tecnico3">Técnico 3</option>
                    </select>

                    {/* Botões */}
                    <div className="w-full flex gap-3 mt-4">
                        {/* Atribuir */}
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-green-700 to-green-600 text-white font-bold py-2 px-4 rounded-md hover:from-green-800 hover:to-green-800 transition ease-in-out duration-150 cursor-pointer w-full"
                        >
                            Atribuir
                        </button>

                        {/* Cancelar */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-2 px-4 rounded-md hover:from-orange-700 hover:to-orange-600 transition ease-in-out duration-150 cursor-pointer w-full"
                        >
                            Cancelar
                        </button>

                        {/* Excluir */}
                        <button
                            type="button"
                            onClick={() => alert("Chamado excluído teste")}
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
