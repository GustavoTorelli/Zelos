'use client'
import { useState } from "react";

export default function StatusButton() {
    const statuses = [
        { label: "Pendente", color: "#B91C1C" },   // vermelho
        { label: "Andamento", color: "#F59E0B" },  // laranja
        { label: "Concluído", color: "#22C55E" }   // verde
    ];

    const [active, setActive] = useState(0);

    return (
        
            <div className="relative flex justify-between rounded-lg overflow-hidden md:w-4/12 w-12/12  mt-5 md:mt-0 ">
                {statuses.map((status, index) => (
                    <button
                        key={index}
                        onClick={() => setActive(index)}
                        className={`flex-1 py-2 text-white font-semibold transition-colors duration-300 cursor-pointer ${
                            active === index ? "text-white" : "text-gray-400"
                        }`}
                    >
                        {status.label}
                    </button>
                ))}

                {/* Barra deslizante */}
                <div
                    className="absolute bottom-0 h-1 rounded transition-all duration-300"
                    style={{
                        width: `${100 / statuses.length}%`,
                        left: `${(100 / statuses.length) * active}%`,
                        backgroundColor: statuses[active].color,
                    }}
                />
            </div>
     
    );
}