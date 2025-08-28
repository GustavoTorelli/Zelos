import prisma from '../prisma-client.js';
import { createPatrimonySchema } from '../../schemas/patrimony.schema.js';
import { ZodError } from 'zod';

export default async function seedPatrimonies() {
	if (process.env.ENVIRONMENT === 'prod') {
		console.log('⚠ Skipping patrimony seeding in production environment');
		return;
	}

	try {
		const initial_patrimonies = [
			{
				name: 'Notebook Dell XPS 13',
				location: 'Sala de Reuniões - Andar 3',
				description:
					'Notebook empresarial utilizado para apresentações e reuniões. Equipado com Intel i7, 16GB RAM e SSD 512GB.',
				code: 'NTB-DELL-XPS13-001',
			},
			{
				name: 'Projetor Epson PowerLite',
				location: 'Auditório Principal',
				description:
					'Projetor de alta definição para apresentações corporativas. Resolução 4K, 5000 lumens de brilho e conectividade HDMI/Wi-Fi.',
				code: 'PROJ-EPSON-4K-002',
			},
			{
				name: 'Mesa de Reunião Executiva',
				location: 'Sala da Diretoria',
				description:
					'Mesa de madeira maciça com capacidade para 12 pessoas. Dimensões: 3m x 1,2m x 0,75m. Inclui sistema de cabos integrado.',
				code: 'MESA-EXEC-MOGNO-003',
			},
			{
				name: 'Ar Condicionado Split',
				location: 'Departamento de TI',
				description:
					'Ar condicionado split 30.000 BTUs com sistema inverter. Manutenção realizada trimestralmente. Instalado em 2023.',
				code: 'AC-SPLIT-30K-004',
			},
			{
				name: 'Servidor Dell PowerEdge',
				location: 'Data Center - Piso Técnico',
				description:
					'Servidor rack 2U com processador Xeon Gold, 64GB RAM, 4x SSD 1TB NVMe. Responsável pelo sistema ERP corporativo.',
				code: 'SRV-DELL-R740-005',
			},
			{
				name: 'Cadeira Ergonômica Presidente',
				location: 'Escritório do CEO',
				description:
					'Cadeira executiva com ajuste lombar, apoio de cabeça e braços reguláveis. Estofamento em couro legítimo.',
				code: 'CAD-ERG-PRES-006',
			},
			{
				name: 'Impressora Multifuncional HP',
				location: 'Área de Copiadora - Andar 2',
				description:
					'Impressora laser colorida com funções de impressão, digitalização, cópia e fax. Capacidade: 5000 páginas/mês.',
				code: 'IMP-HP-MFC-007',
			},
			{
				name: 'Tablet Samsung Galaxy Tab S9',
				location: 'Departamento de Vendas',
				description:
					"Tablet utilizado pela equipe comercial para demonstrações de produtos. Tela 11', 256GB de armazenamento.",
				code: 'TAB-SAMSUNG-S9-008',
			},
			{
				name: 'Armário de Arquivo Metálico',
				location: 'Arquivo Morto - Subsolo',
				description:
					'Armário de aço com 4 gavetas para documentação. Dimensões: 0,9m x 0,45m x 1,8m. Chave de segurança incluída.',
				code: 'ARM-MET-4GV-009',
			},
			{
				name: 'Switch Cisco Catalyst',
				location: 'Rack de Rede - Sala Server',
				description:
					'Switch gerenciável 48 portas Gigabit Ethernet com 4 portas SFP+. Utilizado para infraestrutura de rede principal.',
				code: 'SW-CISCO-48P-010',
			},
		];

		let valid_patrimonies = [];

		for (const patrimony of initial_patrimonies) {
			valid_patrimonies.push(createPatrimonySchema.parse(patrimony));
		}

		for (const patrimony of valid_patrimonies) {
			await prisma.patrimony.upsert({
				where: { code: patrimony.code },
				update: {},
				create: patrimony,
			});
		}

		console.log('✔ Patrimonies seeded successfully');
	} catch (error) {
		if (error instanceof ZodError) {
			console.error('Error seeding patrimonies: Invalid patrimony data');
			return;
		}

		console.error('Error seeding categories:', error);
	}
}
