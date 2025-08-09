import express from 'express';
import apiResponse from './utils/api-response';

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

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
