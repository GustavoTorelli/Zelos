'use client'
import { BadgeCheck } from "lucide-react"
import StatusButton from '../button/StatusButton';
import StatusCard from '../cards/StatusCard';
export default function Status() {
    return (
        <section className="md:w-screen h-full flex flex-col items-center pt-15 ">
            {/* Titulo*/}
            <div className="mb-8 flex justify-between w-10/12   ">
                <div>
                    <h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
                        Status do Chamado
                    </h1>
                    <div className="w-24 h-1 bg-red-700 rounded"></div>
                </div>
                {/* botão para filtrar status */}
                <StatusButton />
            </div>

            {/* seção dos chamados */}
            <section className="flex flex-col  w-10/12  items-start justify-center h-auto ">

                {/* quando não houver chamados */}
                <div className="hidden flex-col items-center justify-center w-full h-[400px] bg-[#1d1e21] rounded-xl gap-6 shadow-lg p-6">
                    <BadgeCheck size={120} color="#B91C1C" />
                    <h1 className="text-xl sm:text-2xl md:text-3xl text-white font-semibold text-center">
                        Você não solicitou nenhum chamado.
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base text-center max-w-md">
                        Assim que você criar um chamado, ele aparecerá aqui.
                    </p>
                </div>

                {/* Chamado individual */}
                <StatusCard />

            </section>
        </section>
    )
}