'use client'
import { useState } from 'react';
import { BadgeCheck } from "lucide-react"
import AtribuirButton from '../button/AtribuirButton';
import AtribuirChamado from '../cards/AtribuirChamado';
import ConcluirChamado from '../cards/ConcluirChamadoPendente';
import VizualizarChamado from '../cards/VizualizarChamadoConcluido';
export default function Atribuir() {
    return (
        <section className="md:w-screen h-full flex flex-col items-center pt-20 ">
            {/* Titulo*/}
            <div className="mb-8 flex justify-between w-10/12   ">
                <div>
                    <h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
                        Gestão de Chamados
                    </h1>
                    <div className="w-24 h-1 bg-red-700 rounded"></div>
                </div>

                {/* botão para filtrar status */}
                <AtribuirButton />
            </div>

            {/* seção dos chamados */}
            <section className="flex flex-wrap items-start  w-12/12 justify-center h-auto ">

                {/* quando não houver chamados */}
                <div className='hidden items-center justify-center w-full h-130  bg-[#1d1e21] rounded-xl gap-5 shadow-[-4px_8px_15px_-9px_rgba(0,_0,_0,_0.7)] '>
                    <BadgeCheck size={180} color='#B91C1C' />
                    <h1 className='text-3xl text-white font-semibold h-1'>Você não solicitou nenhum chamado.</h1>
                </div>

                {/* card de atribuir chamado */}
                <AtribuirChamado />
                <ConcluirChamado />
                <VizualizarChamado/>
            </section>
        </section>
    )
}