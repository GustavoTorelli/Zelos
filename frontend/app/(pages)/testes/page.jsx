'use client' //ignore está página
import { useState } from "react";
import LoginIncorreto from "@/app/components/notifications/loginPage/LoginIncorreto";
import DadosIncorretos from "@/app/components/notifications/solicitarChamado/DadosIncorretos";
import ChamadoConcluido from "@/app/components/notifications/gestaoDeChamados/ChamadoConcluido";
import ChamadoAtualizado from "@/app/components/notifications/gestaoDeChamados/ChamadoAtualizado";
import ChamadoExcluido from "@/app/components/notifications/gestaoDeChamados/ChamadoExcluido";

export default function Page() {
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setAlert] = useState(false)
  const [showConcluido, setConcluido] = useState(false)
  const [showE, setE] = useState(false)
  const [showA, setA] = useState(false)
  return (
    <div className="w-screen h-screen">
      <div className="p-10 flex flex-col w-4/12 gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="px-8 py-2 text-white font-bold text-lg rounded-full shadow-lg transition-transform transform bg-transparent border-2 border-white hover:scale-105 hover:border-green-600 hover:shadow-green-500/50 hover:shadow-2xl focus:outline-none cursor-pointer"
        >
          Mostrar erro
        </button>

        <button
          onClick={() => setAlert(true)}
          className="px-8 py-2 text-white font-bold text-lg rounded-full shadow-lg transition-transform transform bg-transparent border-2 border-white hover:scale-105 hover:border-green-600 hover:shadow-green-500/50 hover:shadow-2xl focus:outline-none cursor-pointer"
        >
          Mostrar Alerta
        </button>

        <button
          onClick={() => setConcluido(true)}
          className="px-8 py-2 text-white font-bold text-lg rounded-full shadow-lg transition-transform transform bg-transparent border-2 border-white hover:scale-105 hover:border-green-600 hover:shadow-green-500/50 hover:shadow-2xl focus:outline-none cursor-pointer"
        >
          Mostrar concluido
        </button>

        <button
          onClick={() => setA(true)}
          className="px-8 py-2 text-white font-bold text-lg rounded-full shadow-lg transition-transform transform bg-transparent border-2 border-white hover:scale-105 hover:border-green-600 hover:shadow-green-500/50 hover:shadow-2xl focus:outline-none cursor-pointer"
        >
          Mostrar atualizado
        </button>

        <button
          onClick={() => setE(true)}
          className="px-8 py-2 text-white font-bold text-lg rounded-full shadow-lg transition-transform transform bg-transparent border-2 border-white hover:scale-105 hover:border-green-600 hover:shadow-green-500/50 hover:shadow-2xl focus:outline-none cursor-pointer"
        >
          Mostrar excluido
        </button>
      </div>

      <DadosIncorretos
        show={showAlert}
        onClose={() => setAlert(false)}
      />

      <LoginIncorreto
        show={showModal}
        onClose={() => setShowModal(false)}
      />

      <ChamadoConcluido
      show={showConcluido}
      onClose={() => setConcluido(false)}
      />

      <ChamadoAtualizado 
      show={showA}
      onClose={() => setA(false)}
      />

      <ChamadoExcluido
      show={showE}
      onClose={()=> setE(false)}
      />

    </div>
  );
}