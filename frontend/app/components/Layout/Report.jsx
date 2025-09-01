'use client';
import ReportGraphics from '../Graphic/ReportGraphics';

export default function Relatorio() {
	return (
		<section className="w-full px-4 py-8">
			<div className="mb-8">
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
					{/* titulo e descrição */}
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="w-1 h-12 bg-gradient-to-b from-red-600 to-red-800 rounded-full"></div>
							<div>
								<h1 className="text-3xl lg:text-4xl font-bold text-white">
									Relatórios e Análises
								</h1>
								<p className="text-gray-400 text-sm mt-1">
									Visualize gráficos interativos e gere
									relatórios detalhados
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Componente de gráficos integrado */}
			<ReportGraphics />
		</section>
	);
}
