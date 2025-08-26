import React, { useState } from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar } from 'lucide-react';

export default function ReportGraphics() {
    // Dados para o gráfico de pizza
    const pieData = [
        { name: 'Direct', value: 35, color: '#3B82F6' },
        { name: 'Social', value: 25, color: '#10B981' },
        { name: 'Search', value: 30, color: '#F59E0B' },
        { name: 'Email', value: 10, color: '#EF4444' },
    ];



    return (
        <div className=" bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-auto p-4 relative">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl"></div>

                <div className="relative z-10">
                    {/* titulo */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400/20 to-red-600/20 flex items-center justify-center shadow-lg">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Gráfico de Chamados</h3>
                            </div>
                        </div>
                    </div>

                    {/* conteudos do grafico */}
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">

                        <div className="relative h-80 w-full lg:w-1/2">
                            {/* numero central */}
                            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
                                <div className="text-2xl font-bold text-white mb-1">12.8K</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">Total Visits</div>
                            </div>

                            {/* Gráfico */}
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={120}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                        filter="url(#glow)"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                style={{
                                                    filter: `drop-shadow(0px 0px 8px ${entry.color}40)`,
                                                    transition: "all 0.3s ease",
                                                }}
                                            />
                                        ))}
                                    </Pie>

                                    {/* legenda dinamica */}

                                    {/* <Tooltip
                                        formatter={(value, name) => [`${value}%`, name]}
                                        contentStyle={{
                                            backgroundColor: "#1F2937",
                                            borderRadius: "8px",
                                            color: "white",
                                            fontSize: "14px",
                                            padding: "8px 12px",
                                        }}
                                    /> */}
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legenda */}
                        <div className="flex flex-col gap-4 w-full lg:w-1/2">
                            {pieData.map((item, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-gradient-to-r from-gray-700/20 to-gray-600/20 rounded-2xl p-4 hover:from-gray-600/30 hover:to-gray-500/30 transition-all duration-300  border border-gray-600/20 hover:border-gray-500/40"
                                >
                                    {/* Glow hover */}
                                    <div
                                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                                        style={{
                                            background: `linear-gradient(135deg, ${item.color}20, transparent)`,
                                            boxShadow: `0 0 20px ${item.color}30`,
                                        }}
                                    ></div>

                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className="w-4 h-4 rounded-full shadow-lg mb-2 group-hover:scale-110 transition-transform duration-300"
                                                style={{
                                                    backgroundColor: item.color,
                                                    boxShadow: `0 0 12px ${item.color}60`,
                                                }}
                                            ></div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-white mb-1">{item.value}%</div>
                                                <div className="text-xs text-gray-400 uppercase tracking-wide">
                                                    {item.name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                                    style={{
                                                        width: `${item.value}%`,
                                                        background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`,
                                                        boxShadow: `0 0 8px ${item.color}40`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );
}