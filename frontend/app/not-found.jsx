export default function () {
    return (
        <section className=" w-screen h-screen flex flex-col items-center justify-center md:bg-[url('/img/global/senai.png')] bg-cover bg-black">
            
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