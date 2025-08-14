import express from 'express';
import apiResponse from './utils/api-response.js';
import seedAdmin from './config/seed-admin.js';
import userRoutes from './routes/User.route.js';
import authRoutes from './routes/Auth.route.js';

const app = express();
const port = 3000;

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

async function start() {
	await seedAdmin();
	app.listen(port, () => {
		console.log(`Server is running at http://localhost:${port}`);
	});
}

start();
