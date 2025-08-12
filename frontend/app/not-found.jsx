export default function () {
    return (
        <section className=" w-screen h-screen flex flex-col items-center justify-center bg-[url('/img/global/senai.png')] bg-cover">
            <h1 className="text-9xl font-extrabold text-white tracking-widest">404</h1>
            <div className="bg-gradient-to-r from-red-800 to-red-700 px-3 py-1 text-sm rounded rotate-12 absolute text-white">
                Nada aqui =(
            </div>
            <a href="chamados">
                <button
                    className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-4 hover:from-red-900 hover:to-red-900 transition ease-in-out duration-150 cursor-pointer w-full sm:w-70"
                >
                    Voltar
                </button>
            </a>
        </section>
    )
}