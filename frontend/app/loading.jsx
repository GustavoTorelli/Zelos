export default function loading() {
    return (

        <div role="status" className="bg-black h-screen w-screen flex justify-center items-center">
            <div className="flex flex-row gap-2">
                <div className="w-4 h-4 rounded-full bg-red-700 animate-bounce"></div>
                <div
                    className="w-4 h-4 rounded-full bg-red-700 animate-bounce [animation-delay:-.3s]"
                ></div>
                <div
                    className="w-4 h-4 rounded-full bg-red-700 animate-bounce [animation-delay:-.5s]"
                ></div>
            </div>

        </div>
    )
}