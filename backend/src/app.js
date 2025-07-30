import express from 'express';

const app = express();
const port = 3000;

app.get('/health', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'online',
		data: null,
		errors: null,
		code: 200,
	});
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
