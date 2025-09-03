import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiResponse from './utils/api-response.js';
import { ensureBrowser } from './utils/report-generator.js';
import setupSwagger from './config/swagger.js';
import seedAdmin from './config/seeds/admin.seed.js';
import seedCategories from './config/seeds/categories.seed.js';
import seedPatrimonies from './config/seeds/patrimony.seed.js';
import userRoutes from './routes/User.route.js';
import authRoutes from './routes/Auth.route.js';
import categoryRoutes from './routes/Category.route.js';
import ticketRoutes from './routes/Ticket.route.js';
import reportRoutes from './routes/Reports.route.js';
import patrimonyRoutes from './routes/Patrimony.route.js';

const app = express();
const port = 3333;

app.use(cors({ origin: process.env.FRONTEND_BASE_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/health', (req, res) => {
	return apiResponse(
		{
			success: true,
			message: 'Online',
			code: 200,
		},
		res,
	);
});

// Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/tickets', ticketRoutes);
app.use('/reports', reportRoutes);
app.use('/patrimonies', patrimonyRoutes);
setupSwagger(app, port);

async function start() {
	await seedAdmin();
	await seedCategories();
	await seedPatrimonies();
	await ensureBrowser()
		.then(() => {
			console.log('correctPuppeteer browser launched');
		})
		.catch((error) => {
			console.error('Error launching puppeteer browser:', error);
			process.exit(1);
		});
	app.listen(port, () => {
		console.log(`Server is running at http://localhost:${port}`);
		console.log(`API docs available at http://localhost:${port}/docs`);
	});
}

start();
