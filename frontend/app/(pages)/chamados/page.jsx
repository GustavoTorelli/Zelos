'use client'

import Sidebar from "@/app/components/Header/Sidebar"
import Atribuir from "@/app/components/Layout/Atribuir"
import Solicitar from "@/app/components/Layout/Soliciatar"
import Status from "@/app/components/Layout/Status"

export default function Chamados() {
    return (
        <section className="flex  justify-center h-screen w-auto">
            <Sidebar/>
            <div className="w-12/12 h-11/12 m-10 flex flex-col  justify-center items-center">
               <Solicitar />
               <Status/>
               <Atribuir/>
            </div>
        </section>
    )
}