'use client'
export default function Solicitar() {
    return (
        <section >
            <h1 className="pb-10 text-2xl text-white">Solicitar chamado</h1>

            <form className="flex flex-col ">
                <input
                    type="text"
                    className=" bg-gray-600/80 w-250 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150  hover:bg-gray-600/90"
                    placeholder="Nome do Patrimonio"
                    maxLength={80}
                />

                <input
                    type="text"
                    className=" bg-gray-600/80 w-250 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150  hover:bg-gray-600/90"
                    placeholder="ID do Patrimonio"
                />

                <select className=" bg-gray-600/80 w-250 text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150  hover:bg-gray-600/90">
                    <option>Tipo de Chamado</option>
                    <option value="">Manutenção</option>
                    <option value="">Apoio Técnico</option>
                    <option value="">Outros</option>
                </select>

                <textarea
                    name="message"
                    className=" bg-gray-600/80 w-250 h-40 resize-none text-white border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none transition ease-in-out duration-150  hover:bg-gray-600/90"
                    placeholder="Descrição do Problema"
                    maxLength={200}
                ></textarea>

                <button
                    type="submit"
                    className="bg-gradient-to-r w-80 from-red-800 to-red-700 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-red-800 hover:to-red-800 transition ease-in-out duration-150 cursor-pointer"
                >
                    Submit
                </button>
            </form>
        </section>
    )
}