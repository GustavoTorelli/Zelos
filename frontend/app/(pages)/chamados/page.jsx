'use client'
import { useState } from "react";
import Sidebar from "@/app/components/Header/Sidebar";
import Atribuir from "@/app/components/Layout/Gestao";
import Solicitar from "@/app/components/Layout/Solicitar";
import Status from "@/app/components/Layout/Status";
import Relatorio from "@/app/components/Layout/Relatorio";
import Header from "@/app/components/Header/Header";

export default function Chamados() {
    const [activeComponent, setActiveComponent] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex flex-col h-screen">
            {/* header */}
            <Header toggleSidebar={toggleSidebar} />

            {/* Conteúdo com Sidebar */}
            <div className="flex flex-1 pt-16">
                {/* Sidebar */}
                <Sidebar onSelect={setActiveComponent} isOpen={sidebarOpen} />

                <section className="flex w-full overflow-y-auto p-6  bg-zinc-100 dark:bg-zinc-800 justify-center items-center md:ml-60
                ">
                    {activeComponent === 1 && <Solicitar />}
                    {activeComponent === 2 && <Status />}
                    {activeComponent === 3 && <Atribuir />}
                    {activeComponent === 4 && <Relatorio />}
                </section>
            </div>
        </div>
    );
}