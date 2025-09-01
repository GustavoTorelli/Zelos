import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { registry } from '../utils/register.js';
import pkg from '@asteasolutions/zod-to-openapi';
const { OpenApiGeneratorV3 } = pkg;

export default function setupSwagger(app, port) {
	// Basic Swagger base configuration
	const swaggerDefinition = {
		openapi: '3.0.0',
		info: {
			title: 'Zelos API',
			version: '1.0.0',
			description: 'API documentation for Zelos',
		},
		servers: [{ url: `http://localhost:${port}` }],
	};

	// Define initial swagger spec and which files to scan for annotations
	const swaggerSpec = swaggerJSDoc({
		swaggerDefinition,
		apis: ['./src/routes/*.js', './src/controllers/*.js'],
	});

	// Generate OpenAPI components from Zod schemas
	const generator = new OpenApiGeneratorV3(registry.definitions || []);
	const zodComponentsRaw = generator.generateComponents();
	const zodComponents =
		zodComponentsRaw?.components || zodComponentsRaw || {};

	// Merge initial spec with generated components
	const finalSpec = {
		...swaggerSpec,
		components: {
			// Add components from routes and controllers and from registered Zod schemas
			...(swaggerSpec.components || {}),
			...zodComponents,
		},
		paths: {
			// Add paths from routes
			...(swaggerSpec.paths || {}),
		},
	};

	// Serve Swagger UI
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(finalSpec));
}
