import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiResponse from './utils/api-response.js';
import seedAdmin from './config/seed-admin.js';
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

async function start() {
	await seedAdmin();
	app.listen(port, () => {
		console.log(`Server is running at http://localhost:${port}`);
	});
}

start();
