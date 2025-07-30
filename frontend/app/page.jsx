export default function Home() {
  return (
    <section className="w-screen h-screen flex items-center justify-center md:bg-[url('/img/senai.png')] md:bg-cover bg-black ">
      <div className="flex flex-col items-center justify-center h-screen dark md:w-200 w-80">
        <div className="w-full max-w-md bg-zinc-900/70 rounded-xl shadow-lg p-8 py-10">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Bem vindo</h2>
          <form className="flex flex-col">
            <input placeholder="Email " className=" bg-gray-600/80 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150  hover:bg-gray-600/90" type="email"></input>
            <input placeholder="Senha" className="bg-gray-600/80 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none  transition ease-in-out duration-150 hover:bg-gray-600/90" type="password"></input>

            <button className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-red-800 hover:to-red-800 transition ease-in-out duration-150 cursor-pointer" type="submit">Entrar</button>
          </form>
        </div>
      </div>
    </section>
  );
}
