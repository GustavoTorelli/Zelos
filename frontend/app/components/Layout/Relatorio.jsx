'use client'
import { BadgeCheck } from "lucide-react"
export default function Relatorio() {
    return (
        <section className="md:w-screen h-full flex flex-col items-center md:pt-15 py-5 md:py-0">
            {/* Titulo*/}
            <div className="mb-8 flex flex-col md:flex-row justify-between w-10/12 gap-4 md:gap-0">
                <div>
                    <h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
                        Gerar Relatório
                    </h1>
                    <div className="w-24 h-1 bg-red-700 rounded"></div>
                </div>

            </div>

            {/* seção de gerar relatorio*/}
            <section className="flex flex-wrap items-center w-12/12 justify-center h-auto">

                {/* quando não houver relatórios*/}
                <div className='flex lg:flex-row flex-col items-center p-10 justify-center w-full h-60 bg-[#1d1e21] rounded-xl gap-5 shadow-[-4px_8px_15px_-9px_rgba(0,_0,_0,_0.7)]'>
                    <BadgeCheck size={180} color='#B91C1C' />
                    <h1 className='w-full text-center text-2xl md:text-3xl p-5 text-white font-semibold'>
                        Você não solicitou nenhum Relatório.
                    </h1>
                </div>

                


            </section>
        </section>
    )
}