'use client'
import { useState } from 'react';
import { ChevronsRight, Goal, CirclePlay, BadgeCheck, MonitorDot, Wrench } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";

export default function StatusCard() {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <motion.div
            className="flex flex-col w-full bg-[#1d1e21] rounded-xl shadow-[-4px_8px_15px_-9px_rgba(0,_0,_0,_0.7)] m-2 overflow-hidden"
        >

            <div className="flex items-center justify-between w-full h-20 px-4">
                {/* Dados  */}
                <div className="flex items-center w-[90%] gap-4 overflow-hidden">
                    {/* id e status */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <h1 className="text-2xs font-medium text-gray-200 flex">
                            #<span>55</span>
                        </h1>
                        {/* Status */}
                        <div className="w-0.5 h-[50px] bg-green-500"></div>
                    </div>

                    {/* nome e id patrimônio */}
                    <div className="flex items-center gap-4 min-w-0">
                        <span className="text-2xs font-medium text-gray-200 truncate uppercase">
                            Nome do patrimônio
                        </span>
                        <h1 className="text-2xs font-medium text-gray-200 flex gap-1 flex-shrink-0 uppercase">
                            ID: <span>2</span>
                        </h1>
                    </div>
                </div>

                {/* Botão expandir */}
                <div className="flex justify-center items-center w-[10%] flex-shrink-0">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        type="button"
                        aria-label="Ver detalhes"
                        className={`cursor-pointer bg-gray-300 dark:bg-gray-200 w-10 h-10 rounded-full flex justify-center items-center hover:ring-4 ring-gray-200 dark:ring-gray-600 transition duration-300 ease-in-out
                        ${isExpanded ? "rotate-90" : ""}`}
                    >
                        <ChevronsRight />
                    </button>
                </div>
            </div>

            {/* apontamentos */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.1, ease: "easeInOut" }}

                    >

                        <div className="flex flex-col gap-4 px-6 pb-6 border-t border-red-800">
                            {/* detalhes*/}
                            <div className="flex justify-between items-center pt-4">
                                <div className="flex gap-2 text-white text-lg uppercase font-semibold">
                                    <h3>Apontamentos Técnicos</h3>
                                </div>
                                <div className="flex items-center gap-4 text-white">
                                    <CirclePlay color="#ed8936" />
                                    <span>dd/mm/aaaa</span>
                                    <Goal color="#22c55e" />
                                    <span>dd/mm/aaaa</span>
                                </div>
                            </div>

                            {/* Apontamentos */}
                            <span className="text-gray-200 text-lg h-auto text-justify">
                                Texto
                            </span>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}