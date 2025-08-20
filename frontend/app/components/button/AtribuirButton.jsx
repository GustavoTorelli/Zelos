'use client'
import { useEffect, useState } from "react";

export default function AtribuirButton({
    statuses = [
        { label: "Pendentes", color: "#F59E0B", value: "pending" },
        { label: "Em Andamento", color: "#F59E0B", value: "in_progress" },
        { label: "Concluídos", color: "#22C55E", value: "completed" },
    ],
    initialIndex = 0,
    onSelect,
}) {
    const [active, setActive] = useState(initialIndex);

    useEffect(() => {
        if (onSelect && statuses[active]) onSelect(statuses[active]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    return (
        <div className="relative flex justify-between rounded-lg overflow-hidden md:w-4/12 w-12/12  mt-5 md:mt-0 bg-zinc-600 md:bg-transparent">
            {statuses.map((status, index) => (
                <button
                    key={index}
                    onClick={() => {
                        setActive(index);
                        if (onSelect) onSelect(status);
                    }}
                    className={`flex-1 py-2 text-white font-semibold transition-colors duration-300 cursor-pointer ${
                        active === index ? "text-white" : "text-gray-400"
                    }`}
                >
                    {status.label}
                </button>
            ))}

            <div
                className="absolute bottom-0 h-1 rounded transition-all duration-300"
                style={{
                    width: `${100 / statuses.length}%`,
                    left: `${(100 / statuses.length) * active}%`,
                    backgroundColor: statuses[active]?.color,
                }}
            />
        </div>
    );
}