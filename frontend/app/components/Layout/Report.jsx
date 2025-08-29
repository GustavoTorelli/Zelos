'use client'
import { Plus, Funnel, Search } from "lucide-react"
import ReportGraphics from "../Graphic/ReportGraphics"
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
                            className="relative w-50 h-12 cursor-pointer flex items-center  border border-red-700 bg-red-700 group  rounded-lg overflow-hidden"
                        >
                            {/* Texto */}
                            <span
                                className="text-white font-semibold ml-8 transform group-hover:translate-x-20 transition-all duration-300"
                            >
                                Gerar PDF
                            </span>

                            {/* icon*/}
                            <span
                                className="absolute right-0 h-full w-12 rounded-lg  bg-red-700 flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300"
                            >
                                <Plus size={20} color="white" />
                            </span>
                        </button>
                    </div>

                </div>
            </div>

            {/* graficos */}
            <ReportGraphics/>

        </section>
    )
}