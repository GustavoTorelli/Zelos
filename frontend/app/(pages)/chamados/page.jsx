'use client'
import { useState } from "react";
import Sidebar from "@/app/components/Header/Sidebar";
import Atribuir from "@/app/components/Layout/Gestao";
import Solicitar from "@/app/components/Layout/Solicitar";
import Status from "@/app/components/Layout/Status";
import Header from "@/app/components/Header/Header";

export default function Chamados() {
    const [activeComponent, setActiveComponent] = useState(1);

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <Header />

            {/* Conteúdo com Sidebar */}
            <div className="flex flex-1 pt-16">
                {/* Sidebar */}
                <Sidebar onSelect={setActiveComponent} />

                {/* Área principal */}
                <section className="
                    flex ml-60 overflow-y-auto p-6 bg-zinc-100 dark:bg-zinc-800 justify-center items-center ">
                    {activeComponent === 1 && <Solicitar />}
                    {activeComponent === 2 && <Status />}
                    {activeComponent === 3 && <Atribuir />}
                </section>
            </div>
        </div>
    );
}