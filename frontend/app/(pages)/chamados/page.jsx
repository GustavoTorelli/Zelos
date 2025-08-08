'use client'
import { useState } from "react"
import Sidebar from "@/app/components/Header/Sidebar"
import Atribuir from "@/app/components/Layout/Atribuir"
import Solicitar from "@/app/components/Layout/Solicitar"
import Status from "@/app/components/Layout/Status"

export default function Chamados() {
    const [activeComponent, setActiveComponent] = useState(1);
    return (
        <section className="flex  justify-center h-screen w-auto">
            <Sidebar onSelect={setActiveComponent} />
            <div className="w-12/12 h-11/12 m-10 flex flex-col  justify-center items-center">
                <div className={activeComponent === 1 ? 'block' : 'hidden'}>
                    <Solicitar />
                </div>

                <div className={activeComponent === 2 ? 'block' : 'hidden'}>
                    <Status />
                </div>

                <div className={activeComponent === 3 ? 'block' : 'hidden'}>
                    <Atribuir />
                </div>
            </div>
        </section>
    )
}