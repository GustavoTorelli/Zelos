'use client'
import { Plus, Funnel, Search } from "lucide-react"
export default function Relatorio() {
    return (
        <section className="w-full px-4 py-8">
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    {/* titulo e descrição */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-12 bg-gradient-to-b from-red-600 to-red-800 rounded-full"></div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                                    Gerar Relatórios
                                </h1>
                                <p className="text-gray-400 text-sm mt-1">
                                    Vizualize Gráficos e gere relatórios
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botão para gerar relatorio*/}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            className="relative w-50 h-12 cursor-pointer flex items-center 
           border border-red-700 bg-red-700 group 
           rounded-lg overflow-hidden"
                        >
                            {/* Texto */}
                            <span
                                className="text-white font-semibold ml-8 transform 
             group-hover:translate-x-20 transition-all duration-300"
                            >
                                Gerar PDF
                            </span>

                            {/* icon*/}
                            <span
                                className="absolute right-0 h-full w-12 rounded-lg 
             bg-red-700 flex items-center justify-center 
             transform group-hover:translate-x-0 
             group-hover:w-full transition-all duration-300"
                            >
                                <Plus size={20} color="white" />
                            </span>
                        </button>
                    </div>

                </div>
            </div>

            {/* filtros */}
            <div className="mb-8">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <div className="w-5 h-5 text-red-500">
                                <Funnel size={20} />
                            </div>
                            Filtros
                        </h3>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* id do patrimonio */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <div className="h-5 w-5 text-gray-400 ">
                                    <Search size={20} />
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar ID do patrimonio"
                               
                            
                                className="w-full bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            />
                        </div>

                        {/* categorias */}
                        <div className="relative">
                            <select
                                
                            
                                className="w-full appearance-none bg-gray-700/50 border border-gray-600/50 text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            >
                                <option value="">Selecionar categoria</option>
                                <option value="">teste</option>
                                <option value="">teste</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* status */}
                        <div className="relative">
                            <select
                             
                                className="w-full appearance-none bg-gray-700/50 border border-gray-600/50 text-white rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            >
                                <option value="all">Selecionar status</option>
                                <option value="active">Pendentes</option>
                                <option value="inactive">Em andamento</option>
                                <option value="inactive">Concluidos</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[400px] p-4">
            </div>

        </section>
    )
}