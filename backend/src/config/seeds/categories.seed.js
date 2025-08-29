import prisma from '../prisma-client.js';
import { createCategorySchema } from '../../schemas/category.schema.js';
import { ZodError } from 'zod';

export default async function seedCategories() {
	if (process.env.ENVIRONMENT === 'prod') {
		console.log('⚠ Skipping category seeding in production environment');
		return;
	}

	try {
		const initial_categories = [
			{
				title: 'Manutenção Elétrica',
				description:
					'Falhas de energia, problemas em tomadas, iluminação e quadros elétricos.',
			},
			{
				title: 'Manutenção Hidráulica',
				description:
					'Vazamentos, entupimentos e problemas em torneiras.',
			},
			{
				title: 'Manutenção Predial',
				description: 'Reparos em paredes, pisos, portas e telhados.',
			},
			{
				title: 'TI - Hardware',
				description:
					'Falhas em computadores, notebooks, impressoras e periféricos.',
			},
			{
				title: 'TI - Software',
				description:
					'Instalação, atualização ou falha de softwares e sistemas.',
			},
			{
				title: 'TI - Rede',
				description:
					'Problemas de conectividade, Wi-Fi e acesso à internet.',
			},
			{
				title: 'Equipamentos de Laboratório',
				description:
					'Problemas com máquinas CNC, bancadas de teste, tornos e equipamentos específicos.',
			},
			{
				title: 'Suporte Acadêmico',
				description:
					'Solicitação de materiais, reserva de salas e problemas de impressão.',
			},
		];

		let valid_categories = [];

		for (const category of initial_categories) {
			valid_categories.push(createCategorySchema.parse(category));
		}

		for (const category of valid_categories) {
			await prisma.category.upsert({
				where: { title: category.title },
				update: {},
				create: {
					...category,
					created_by: 1,
					updated_by: 1,
				},
			});
		}

		console.log('✔ Categories seeded successfully');
	} catch (error) {
		if (error instanceof ZodError) {
			console.error('Error seeding categories: Invalid category data');
			return;
		}

		console.error('Error seeding categories:', error);
	}
}
