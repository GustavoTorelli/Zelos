export default function Home() {
  return (
    <section className="w-screen h-screen flex items-center justify-center imagem ">
      <div className="flex flex-col items-center justify-center h-screen dark md:w-200 w-80">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-8 py-10">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Login</h2>
          <form className="flex flex-col">
            <input placeholder="Email address" className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150" type="email"></input>
            <input placeholder="Password" className="bg-gray-700 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150" type="password"></input>

            <button className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150" type="submit">Login</button>
          </form>
        </div>
      </div>
    </section>
  );
}
