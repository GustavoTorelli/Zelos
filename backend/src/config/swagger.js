import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { registry } from '../utils/register.js'; // seu registry
import pkg from '@asteasolutions/zod-to-openapi';

// porque o pacote é CommonJS: pegamos o export do default
const { OpenApiGeneratorV3 } = pkg;

export default function setupSwagger(app, port) {
	const swaggerDefinition = {
		openapi: '3.0.0',
		info: {
			title: 'Zelos API',
			version: '1.0.0',
			description: 'API documentation for Zelos',
		},
		servers: [{ url: `http://localhost:${port}` }],
	};

	// 1) gera spec a partir dos comentários JSDoc (rotas/controllers)
	const swaggerSpec = swaggerJSDoc({
		swaggerDefinition,
		apis: ['./src/routes/*.js', './src/controllers/*.js'], // seus JSDoc
	});

	// 2) gera componentes a partir do registry zod -> OpenAPI
	const generator = new OpenApiGeneratorV3(registry.definitions || []);
	// generateComponents() produz a seção de components (schemas, parameters, etc)
	const zodComponentsRaw = generator.generateComponents();

	// dependendo da versão a lib pode retornar:
	// { components: { schemas: {...} } }  OR  { schemas: {...}, parameters: {...} }
	// normalizamos para um objeto components
	const zodComponents =
		zodComponentsRaw && zodComponentsRaw.components
			? zodComponentsRaw.components
			: zodComponentsRaw || {};

	// 3) mescla components do swagger-jsdoc + components gerados pelo zod
	const finalSpec = {
		...swaggerSpec,
		components: {
			...((swaggerSpec && swaggerSpec.components) || {}),
			...zodComponents,
		},
		// mantemos os paths vindos dos comentários; se quiser incluir caminhos
		// registrados no registry, veja nota abaixo.
		paths: {
			...((swaggerSpec && swaggerSpec.paths) || {}),
		},
	};

	app.use('/docs', swaggerUi.serve, swaggerUi.setup(finalSpec));
}
