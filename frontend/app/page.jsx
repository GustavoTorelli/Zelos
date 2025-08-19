'use client'
import { useState } from "react";
export default function Home() {
  const [resetMode, setResetMode] = useState(false);
  return (

    <section className="w-screen h-screen flex flex-col items-center md:justify-center md:bg-[url('/img/global/senai.png')] md:bg-cover bg-black ">

      {/* header mobile */}
      <header className="
        fixed top-0 left-0 z-50
        w-full h-16
        bg-zinc-900
        flex items-center justify-between
        px-6
        md:hidden
    ">

        {/* Logo */}
        <div className=" absolute left-1/2 transform -translate-x-1/2 md:static md:ml-0 flex items-center justify-center w-auto h-full">
          <img src="/img/global/logo_branco.svg" className="h-9" alt="Logo" />
        </div>
      </header>


      {/* formularios */}
      <div className="flex flex-col md:items-center md:justify-center h-screen dark md:w-200 w-80 items-center justify-evenly">


        {/* Login form */}
        <div className="w-full max-w-md bg-zinc-900/70 rounded-xl shadow-lg p-8 py-10">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">
            {resetMode ? "Recuperar Senha" : "Bem vindo"}
          </h2>

          <form className={`flex flex-col ${resetMode ? "hidden" : "flex"}`} id="login">
            <input
              placeholder="Usuário"
              className="bg-gray-600/80 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
              type="text"
            />
            <input
              placeholder="Senha"
              className="bg-gray-600/80 text-white border-0 rounded-md p-2 mb-2 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
              type="password"
            />

            {/* Esqueceu a senha */}
            <div className="flex justify-start p-1 ">
              <button
                type="button"
                onClick={() => setResetMode(true)}
                className="text-sm text-white cursor-pointer hover:text-red-700 font-semibold"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-2 hover:from-red-900 hover:to-red-800 transition ease-in-out duration-150 cursor-pointer"
              type="submit"
            >
              Entrar
            </button>
          </form>

          {/* resetar senha */}
          <form className={`flex flex-col ${resetMode ? "flex" : "hidden"}`} id="novaSenha">
            <div className="flex flex-col">
              <input
                placeholder="Digite seu e-mail"
                className="bg-gray-600/80 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                type="email"
              />

              <button
                className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-2 hover:from-red-900 hover:to-red-800 transition ease-in-out duration-150 cursor-pointer"
                type="submit"
              >
                Enviar
              </button>
            </div>

            {/* confirmação do email*/}

            <div className="hidden">
              <h1 className="text-white"><b className="text-red-600 font-semibold">E-mail enviado! </b> Verifique sua caixa de entrada para redefinir sua senha.</h1>
            </div>

            <div className="flex justify-center pt-5">
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="text-sm text-white cursor-pointer hover:text-red-700 font-semibold"
              >
                Voltar ao login
              </button>
            </div>
          </form>
          <div>
          </div>
        </div>
      </div>
    </section>
  );
}