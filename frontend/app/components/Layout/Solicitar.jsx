'use client'
export default function Solicitar() {
    return (
        <section className="md:w-screen w-screen h-full flex flex-col items-center md:pt-15 py-5 md:py-0">
            {/* Titulo*/}
            <div className="mb-8 flex flex-col md:flex-row justify-between w-10/12">
                <div>
                    <h1 className="pb-2 text-2xl sm:text-3xl text-white font-semibold">
                        Solicitar chamado
                    </h1>
                    <div className="w-24 h-1 bg-red-700 rounded"></div>
                </div>
            </div>

            {/* formulario */}
            <form className="flex flex-col w-10/12 h-8/12 items-center justify-center">
                <input
                    type="text"
                    className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                    placeholder="Nome do Patrimônio"
                    maxLength={80}
                />

                <input
                    type="text"
                    className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                    placeholder="ID do Patrimônio"
                />

                <select className="bg-gray-600/80 w-full text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90">
                    <option>Tipo de Chamado</option>
                    <option value="">Manutenção</option>
                    <option value="">Apoio Técnico</option>
                    <option value="">Outros</option>
                </select>

                <textarea
                    name="message"
                    className="bg-gray-600/80 w-full h-65 resize-none text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150 hover:bg-gray-600/90"
                    placeholder="Descrição do Problema"
                    maxLength={200}
                ></textarea>

                <div className="w-full flex items-start">
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-4 hover:from-red-900 hover:to-red-900 transition ease-in-out duration-150 cursor-pointer w-full sm:w-64"
                    >
                        Enviar
                    </button>
                </div>
            </form>
        </section>
    )
}